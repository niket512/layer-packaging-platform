import { createClient } from "npm:@supabase/supabase-js@2";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "../_shared/run-id.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const SYSTEM = `You extract products from a manufacturer's product catalogue PDF for a B2B packaging marketplace.
ALWAYS fill "page" (a number) for every product — it is required to attach the product photo.
Reply with ONLY a JSON object, no markdown: {"products":[{"name","category","material","capacity","dimensions","moq","description","page","bbox"}]}.
- name: short buyer-facing product name, no brand names of customers.
- category: e.g. "Bottle", "Jar", "Pouch", "Sachet", "Cap", "Box", "Label".
- material, capacity (with unit), dimensions, moq: strings or null if not stated.
- description: one sentence from catalogue facts only.
- page: 1-based PDF page number where the product's photo/drawing appears, or null.
- bbox: [x0, y0, x1, y1] tight box around that product's photo on that page, as fractions 0-1 of page width/height measured from the top-left corner, or null if no photo.
Only list products whose photo or drawing appears on these pages. Do NOT create products from spec/price tables or index pages; use such tables only to fill details. Never invent facts. Include at most 150 products.`;

const num = (v: unknown) => { const n = Number(v); return v != null && v !== "" && isFinite(n) && n > 0 ? n : null; };
const box = (v: unknown) => {
  if (!Array.isArray(v) || v.length !== 4) return null;
  const b = v.map((x) => Math.min(1, Math.max(0, Number(x))));
  if (b.some((x) => !isFinite(x)) || b[2] - b[0] < 0.02 || b[3] - b[1] < 0.02) return null;
  return b;
};

const str = (v: unknown, n: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const auth = req.headers.get("Authorization") ?? "";
  const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: userData } = await userClient.auth.getUser();
  const user = userData?.user;
  if (!user) return json({ error: "Please sign in" }, 401);

  let uploadId: string;
  let pageText: string | null = null;
  let pageImages: { page: number; url: string }[] | null = null;
  try {
    const b = await req.json();
    uploadId = String(b.uploadId ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(uploadId)) throw new Error();
    if (typeof b.text === "string" && b.text.trim()) pageText = b.text.slice(0, 260_000);
    if (Array.isArray(b.images) && b.images.length) {
      pageImages = b.images.slice(0, 6)
        .filter((x: { page?: unknown; url?: unknown }) => Number.isInteger(x?.page) && typeof x?.url === "string" && x.url.startsWith("data:image/jpeg;base64,") && x.url.length < 3_000_000)
        .map((x: { page: number; url: string }) => ({ page: x.page, url: x.url }));
      if (!pageImages!.length) pageImages = null;
    }
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: up } = await admin.from("catalogue_uploads").select("*").eq("id", uploadId).maybeSingle();
  if (!up || up.owner_id !== user.id) return json({ error: "Upload not found" }, 404);

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json({ error: "AI is not configured" }, 500);

  const fail = async (message: string, status: number) => {
    await admin.from("catalogue_uploads").update({ status: "failed", error: message }).eq("id", uploadId);
    return json({ error: message }, status);
  };

  await admin.from("catalogue_uploads").update({ status: "processing", error: null }).eq("id", uploadId);

  let content: Array<Record<string, unknown>>;
  if (pageImages) {
    content = [{ type: "text", text: "Extract every product from these catalogue pages. Each picture is labelled with its page number; use it for \"page\" and give a tight bbox around each product's photo on that page." }];
    for (const im of pageImages) {
      content.push({ type: "text", text: `Page ${im.page}:` });
      content.push({ type: "image_url", image_url: { url: im.url } });
    }
  } else if (pageText) {
    content = [{ type: "text", text: `Extract every product from this catalogue. Its text is given page by page; use those page numbers. Pages showing more photos usually hold more products.\n${pageText}` }];
  } else {
    const { data: file, error: dlErr } = await admin.storage.from("catalogue-pdfs").download(up.file_path);
    if (dlErr || !file) return fail("Could not read the PDF", 500);
    if (file.size > 8 * 1024 * 1024) return fail("This PDF has no readable text and is too large — try a smaller PDF", 413);
    const bytes = new Uint8Array(await file.arrayBuffer());
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    content = [
      { type: "text", text: "Extract every product from this catalogue." },
      { type: "file", file: { filename: up.file_name, file_data: `data:application/pdf;base64,${btoa(bin)}` } },
    ];
  }

  // Plain (non-streamed) request: streaming a long answer used up the function's CPU budget.
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(req));
  let failure: { status: number; message: string } | null = null;
  let text = "";
  try {
    const r = await runIdFetch.fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        reasoning_effort: "low",
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content }],
      }),
      signal: req.signal,
    });
    if (!r.ok) failure = { status: r.status, message: (await r.text()).slice(0, 300) };
    else text = (await r.json()).choices?.[0]?.message?.content ?? "";
  } catch {
    failure = { status: 500, message: "AI request failed" };
  }
  if (failure) {
    const f = failure as { status: number; message: string };
    const msg = f.status === 402 ? "AI credits have run out — add credits in Settings → Plans & credits"
      : f.status === 429 ? "AI is busy right now, please try again in a minute"
      : f.status === 403 ? f.message : "AI could not read this catalogue, please try again";
    return fail(msg, f.status);
  }

  let items: Record<string, unknown>[] = [];
  try {
    const m = text.match(/\{[\s\S]*\}/);
    items = JSON.parse(m ? m[0] : text).products ?? [];
  } catch {
    return fail("AI returned an unreadable result, please try again", 502);
  }

  const rows = items.slice(0, 150).map((p) => ({
    store_id: up.store_id,
    owner_id: user.id,
    upload_id: uploadId,
    name: str(p.name, 200) ?? "Untitled product",
    category: str(p.category, 80),
    material: str(p.material, 120),
    capacity: str(p.capacity, 80),
    dimensions: str(p.dimensions, 120),
    moq: str(p.moq, 80),
    description: str(p.description, 600),
    page: num(p.page) ? Math.round(num(p.page)!) : null,
    bbox: box(p.bbox),
    status: "draft",
  }));
  if (rows.length) {
    const { error } = await admin.from("market_products").insert(rows);
    if (error) return fail("Could not save products", 500);
  }
  await admin.from("catalogue_uploads").update({ status: "done" }).eq("id", uploadId);
  return json({ count: rows.length });
});
