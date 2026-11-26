import type * as Pdfjs from "pdfjs-dist";

// pdf.js and its worker touch browser-only APIs, so both load only when a supplier chooses a PDF.
let pdfjsPromise: Promise<typeof Pdfjs> | undefined;
function loadPdfjs() {
  pdfjsPromise ??= Promise.all([import("pdfjs-dist"), import("pdfjs-dist/build/pdf.worker.min.mjs?url")]).then(([lib, worker]) => {
    lib.GlobalWorkerOptions.workerSrc = worker.default;
    return lib;
  });
  return pdfjsPromise;
}

export type CropRequest = { id: string; page: number | null; bbox: number[] | null };
type Box = [number, number, number, number]; // fractions of page, top-left origin
type Matrix = [number, number, number, number, number, number];

const mul = (a: Matrix, b: Matrix): Matrix => [
  a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
  a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
  a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5],
];

/** Finds where embedded photos are drawn on a page (fractions, top-left origin), reading order. */
async function imageBoxes(pdfjs: typeof Pdfjs, page: Pdfjs.PDFPageProxy, vp: Pdfjs.PageViewport): Promise<Box[]> {
  const ops = await page.getOperatorList();
  const O = pdfjs.OPS;
  let ctm: Matrix = [1, 0, 0, 1, 0, 0];
  const stack: Matrix[] = [];
  const boxes: Box[] = [];
  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i];
    if (fn === O.save) stack.push(ctm);
    else if (fn === O.restore) ctm = stack.pop() ?? ctm;
    else if (fn === O.transform) ctm = mul(ctm, ops.argsArray[i] as Matrix);
    else if (fn === O.paintImageXObject || fn === O.paintInlineImageXObject || fn === O.paintImageMaskXObject) {
      const m = mul(vp.transform as Matrix, ctm);
      const xs = [m[4], m[0] + m[4], m[2] + m[4], m[0] + m[2] + m[4]];
      const ys = [m[5], m[1] + m[5], m[3] + m[5], m[1] + m[3] + m[5]];
      const b: Box = [Math.min(...xs) / vp.width, Math.min(...ys) / vp.height, Math.max(...xs) / vp.width, Math.max(...ys) / vp.height];
      const w = b[2] - b[0], h = b[3] - b[1];
      // skip logos/icons and full-page backgrounds
      if (w > 0.06 && h > 0.06 && w * h < 0.7) boxes.push(b.map((v) => Math.min(1, Math.max(0, v))) as Box);
    }
  }
  return boxes.sort((a, b) => (Math.abs(a[1] - b[1]) < 0.05 ? a[0] - b[0] : a[1] - b[1]));
}

const overlap = (a: Box, b: Box) => {
  const w = Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0]));
  const h = Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
  return w * h;
};

/** Renders every page to a small JPEG, for scanned PDFs that have no text. */
export async function pdfPageImages(file: File, maxPx = 1400): Promise<{ page: number; url: string }[]> {
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const out: { page: number; url: string }[] = [];
  for (let n = 1; n <= Math.min(doc.numPages, 60); n++) {
    const page = await doc.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: maxPx / Math.max(base.width, base.height) });
    const c = document.createElement("canvas");
    c.width = viewport.width; c.height = viewport.height;
    await page.render({ canvasContext: c.getContext("2d")!, viewport }).promise;
    out.push({ page: n, url: c.toDataURL("image/jpeg", 0.75) });
    page.cleanup();
  }
  await doc.destroy();
  return out;
}

/** Reads the PDF's text page by page in the browser, so big PDFs don't need to be sent to the AI whole. */
export async function pdfPageText(file: File, maxChars = 250_000): Promise<string> {
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  let out = "";
  for (let n = 1; n <= doc.numPages && out.length < maxChars; n++) {
    const page = await doc.getPage(n);
    const tc = await page.getTextContent();
    const text = tc.items.map((i) => ("str" in i ? i.str : "")).join(" ").replace(/\s+/g, " ").trim();
    const photos = (await imageBoxes(pdfjs, page, page.getViewport({ scale: 1 }))).length;
    out += `\n=== Page ${n} (${photos} product photos) ===\n${text}\n`;
    page.cleanup();
  }
  await doc.destroy();
  return out.slice(0, maxChars);
}

/** Renders the needed PDF pages in the browser and returns a JPEG data URL per product. */
export async function cropProductImages(file: File, items: CropRequest[]): Promise<Record<string, string>> {
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const out: Record<string, string> = {};
  const byPage = new Map<number, CropRequest[]>();
  for (const it of items) {
    if (!it.page || it.page < 1 || it.page > doc.numPages) continue;
    byPage.set(it.page, [...(byPage.get(it.page) ?? []), it]);
  }
  for (const [pageNo, list] of byPage) {
    const page = await doc.getPage(pageNo);
    const viewport = page.getViewport({ scale: 2 });
    const photos = await imageBoxes(pdfjs, page, viewport);
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
    const used = new Set<number>();
    list.forEach((it, idx) => {
      let box: Box | null = null;
      if (photos.length) {
        // snap AI's rough box to the closest real photo, else take photos in reading order
        let best = -1;
        if (it.bbox) {
          let score = 0;
          photos.forEach((p, i) => { const s = overlap(p, it.bbox as Box); if (s > score) { score = s; best = i; } });
        }
        if (best < 0) best = photos.findIndex((_, i) => !used.has(i));
        if (best < 0) best = idx % photos.length;
        used.add(best);
        box = photos[best] ?? null;
      } else if (it.bbox) box = it.bbox as Box;
      else if (list.length === 1) box = [0.05, 0.05, 0.95, 0.95];
      if (!box) return;
      const [x0, y0, x1, y1] = box;
      const pad = 0.005;
      const sx = Math.max(0, (x0 - pad) * canvas.width);
      const sy = Math.max(0, (y0 - pad) * canvas.height);
      const sw = Math.min(canvas.width - sx, (x1 - x0 + pad * 2) * canvas.width);
      const sh = Math.min(canvas.height - sy, (y1 - y0 + pad * 2) * canvas.height);
      if (sw < 10 || sh < 10) return;
      const scale = Math.min(1, 600 / Math.max(sw, sh));
      const c = document.createElement("canvas");
      c.width = Math.round(sw * scale);
      c.height = Math.round(sh * scale);
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, c.width, c.height);
      out[it.id] = c.toDataURL("image/jpeg", 0.82);
    });
    page.cleanup();
  }
  await doc.destroy();
  return out;
}
