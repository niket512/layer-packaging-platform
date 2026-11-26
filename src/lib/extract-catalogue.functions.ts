import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseStatus } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "@/lib/ai-gateway-run-id";

const SYSTEM = `You are a packaging-procurement data analyst. Convert the manufacturer catalogue pages into a structured product list with photo locations, ready to load into a supplier/SKU database.

METHOD
- First map the catalogue's visual grammar: the repeating "panel" unit (e.g. coloured header bar + product photo with item codes + code/capacity table), the section heading per page, and special pages (cover, company profile, spec table, colour chart, closures, pumps).
- Transcribe details EXACTLY as printed: per panel note the page, section heading, series/range name verbatim, panel notes (options, neck finishes per code, plug/wad options, weight variants, printing MOQs, "new" flags), then every item code with its capacity/size and unit as printed (ml / gm / oz; keep OFC vs nominal distinctions).
- Spec tables: read them carefully and join spec rows to items by item code within the matching series. Where codes differ (suffixes like (P), (FT), (C1), A/B variants) map explicitly; if there is no clear match, leave the detail blank — never guess.
- Closures / caps / pumps / accessories count as products too: code, name, neck diameter or finish, dosage, options.

QUALITY RULES
- Preserve codes, punctuation, units and tolerances verbatim; never reformat an item code.
- Every product carries a page reference. Flag inferences in the description. Add nothing the catalogue does not state (prices, MOQs, lead times, materials).
- One product per (panel x item code): an item shown in several series gets an entry in each (different application and photo); do not de-duplicate.

OUTPUT
ALWAYS fill "page" (a number) for every product — it is required to attach the product photo.
Reply with ONLY a JSON object, no markdown: {"products":[{"name","category","material","capacity","dimensions","moq","description","page","bbox"}]}.
- name: short buyer-facing product name including the series/range name and item code as printed, no customer brand names.
- category: e.g. "Bottle", "Jar", "Pouch", "Sachet", "Cap", "Closure", "Pump", "Box", "Label".
- material, capacity (with unit), dimensions, moq: strings or null if not stated. For rigid bottles/jars prefer capacity, neck finish, dimensions; for pouches prefer W x H x gusset and laminate structure.
- description: one sentence from catalogue facts only (options, neck finishes, "new" flags).
- page: 1-based PDF page number where the product's photo/drawing appears, or null.
- bbox: [x0, y0, x1, y1] tight box around that product's photo on that page, as fractions 0-1 of page width/height measured from the top-left corner, or null if no photo.
Only list products whose photo or drawing appears on these pages. Do NOT create products from spec/price tables or index pages; use such tables only to fill details. Never invent facts. Include at most 150 products.`;

const Body = z.object({
  uploadId: z.string().uuid(),
  text: z.string().max(260000).optional(),
  images: z.array(z.object({
    page: z.number().int().positive(),
    url: z.string().startsWith("data:image/jpeg;base64,").max(3000000),
  }).strict()).max(6).optional(),
}).strict();

const num = (value: unknown) => {
  const number = Number(value);
  return value != null && value !== "" && isFinite(number) && number > 0 ? number : null;
};
const box = (value: unknown) => {
  if (!Array.isArray(value) || value.length !== 4) return null;
  const bounds = value.map(item => Math.min(1, Math.max(0, Number(item))));
  if (bounds.some(item => !isFinite(item)) || bounds[2]! - bounds[0]! < 0.02 || bounds[3]! - bounds[1]! < 0.02) return null;
  return bounds;
};
const str = (value: unknown, length: number) => typeof value === "string" && value.trim() ? value.trim().slice(0, length) : null;

export const extractCatalogue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(Body)
  .handler(async ({ data: body, context }) => {
    const { data: upload } = await context.supabase.from("catalogue_uploads").select("*").eq("id", body.uploadId).maybeSingle();
    if (!upload || upload.owner_id !== context.userId || !String(upload.file_path).startsWith(`${context.userId}/`) || String(upload.file_path).includes("..")) {
      setResponseStatus(404);
      throw new Error("Upload not found");
    }

    // The caller owns this upload; privileged access is needed only for processing and storage.
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const fail = async (message: string, status: number): Promise<never> => {
      await admin.from("catalogue_uploads").update({ status: "failed", error: message }).eq("id", body.uploadId);
      setResponseStatus(status);
      throw new Error(message);
    };
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) await fail("AI is not configured", 500);
    await admin.from("catalogue_uploads").update({ status: "processing", error: null }).eq("id", body.uploadId);

    const pageText = body.text?.trim() ? body.text : null;
    const pageImages = body.images?.length ? body.images : null;
    let content: Array<Record<string, unknown>>;
    if (pageImages) {
      content = [{ type: "text", text: "Extract every product from these catalogue pages. Each picture is labelled with its page number; use it for \"page\" and give a tight bbox around each product's photo on that page." }];
      for (const image of pageImages) {
        content.push({ type: "text", text: `Page ${image.page}:` });
        content.push({ type: "image_url", image_url: { url: image.url } });
      }
    } else if (pageText) {
      content = [{ type: "text", text: `Extract every product from this catalogue. Its text is given page by page; use those page numbers. Pages showing more photos usually hold more products.\n${pageText}` }];
    } else {
      const download = await admin.storage.from("catalogue-pdfs").download(upload.file_path);
      if (download.error) return fail("Could not read the PDF", 500);
      const file = download.data;
      if (!file) return fail("Could not read the PDF", 500);
      if (file.size > 8 * 1024 * 1024) return fail("This PDF has no readable text and is too large — try a smaller PDF", 413);
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = "";
      for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
      content = [
        { type: "text", text: "Extract every product from this catalogue." },
        { type: "file", file: { filename: upload.file_name, file_data: `data:application/pdf;base64,${btoa(binary)}` } },
      ];
    }

    const request = getRequest();
    const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
    let failure: { status: number; message: string } | null = null;
    let text = "";
    try {
      const response = await runIdFetch.fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-6-astra",
          reasoning_effort: "low",
          response_format: { type: "json_object" },
          messages: [{ role: "system", content: SYSTEM }, { role: "user", content }],
        }),
        signal: request.signal,
      });
      if (!response.ok) failure = { status: response.status, message: (await response.text()).slice(0, 300) };
      else text = (await response.json()).choices?.[0]?.message?.content ?? "";
    } catch {
      failure = { status: 500, message: "AI request failed" };
    }
    if (failure) {
      const current = failure as { status: number; message: string };
      const message = current.status === 402
        ? "AI credits have run out — add credits in Settings → Plans & credits"
        : current.status === 429
          ? "AI is busy right now, please try again in a minute"
          : current.status === 403
            ? current.message
            : "AI could not read this catalogue, please try again";
      await fail(message, current.status);
    }

    let items: Record<string, unknown>[] = [];
    try {
      const match = text.match(/\{[\s\S]*\}/);
      items = JSON.parse(match ? match[0] : text).products ?? [];
    } catch {
      await fail("AI returned an unreadable result, please try again", 502);
    }

    const rows = items.slice(0, 150).map(product => ({
      store_id: upload.store_id,
      owner_id: context.userId,
      upload_id: body.uploadId,
      name: str(product["name"], 200) ?? "Untitled product",
      category: str(product["category"], 80),
      material: str(product["material"], 120),
      capacity: str(product["capacity"], 80),
      dimensions: str(product["dimensions"], 120),
      moq: str(product["moq"], 80),
      description: str(product["description"], 600),
      page: num(product["page"]) ? Math.round(num(product["page"])!) : null,
      bbox: box(product["bbox"]),
      status: "draft" as const,
    }));
    if (rows.length) {
      const { error } = await admin.from("market_products").insert(rows);
      if (error) await fail("Could not save products", 500);
    }
    await admin.from("catalogue_uploads").update({ status: "done" }).eq("id", body.uploadId);
    return { count: rows.length };
  });
