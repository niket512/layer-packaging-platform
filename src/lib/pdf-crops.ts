import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export type CropRequest = { id: string; page: number; bbox: number[] };

/** Renders the needed PDF pages in the browser and returns a JPEG data URL per product. */
export async function cropProductImages(file: File, items: CropRequest[]): Promise<Record<string, string>> {
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const out: Record<string, string> = {};
  const byPage = new Map<number, CropRequest[]>();
  for (const it of items) {
    if (it.page < 1 || it.page > doc.numPages) continue;
    byPage.set(it.page, [...(byPage.get(it.page) ?? []), it]);
  }
  for (const [pageNo, list] of byPage) {
    const page = await doc.getPage(pageNo);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
    for (const it of list) {
      const [x0, y0, x1, y1] = it.bbox;
      const pad = 0.01;
      const sx = Math.max(0, (x0 - pad) * canvas.width);
      const sy = Math.max(0, (y0 - pad) * canvas.height);
      const sw = Math.min(canvas.width - sx, (x1 - x0 + pad * 2) * canvas.width);
      const sh = Math.min(canvas.height - sy, (y1 - y0 + pad * 2) * canvas.height);
      if (sw < 10 || sh < 10) continue;
      const scale = Math.min(1, 600 / Math.max(sw, sh));
      const c = document.createElement("canvas");
      c.width = Math.round(sw * scale);
      c.height = Math.round(sh * scale);
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, c.width, c.height);
      out[it.id] = c.toDataURL("image/jpeg", 0.82);
    }
    page.cleanup();
  }
  await doc.destroy();
  return out;
}
