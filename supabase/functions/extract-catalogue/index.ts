import { createOpenAI } from "npm:@ai-sdk/openai";
import { streamText } from "npm:ai";
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
Reply with ONLY a JSON object, no markdown: {"products":[{"name","category","material","capacity","dimensions","moq","description","page","bbox"}]}.
- name: short buyer-facing product name, no brand names of customers.
- category: e.g. "Bottle", "Jar", "Pouch", "Sachet", "Cap", "Box", "Label".
- material, capacity (with unit), dimensions, moq: strings or null if not stated.
- description: one sentence from catalogue facts only.
- page: 1-based PDF page number where the product's photo/drawing appears, or null.
- bbox: [x0, y0, x1, y1] tight box around that product's photo on that page, as fractions 0-1 of page width/height measured from the top-left corner, or null if no photo.
Never invent facts. Include at most 150 products.`;

const num = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : null);
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
  try {
    const b = await req.json();
    uploadId = String(b.uploadId ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(uploadId)) throw new Error();
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
  const { data: file, error: dlErr } = await admin.storage.from("catalogue-pdfs").download(up.file_path);
  if (dlErr || !file) return fail("Could not read the PDF", 500);

  const bytes = new Uint8Array(await file.arrayBuffer());
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  const base64 = btoa(bin);

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(req));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  let failure: { status: number; message: string } | null = null;
  let text = "";
  try {
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system: SYSTEM,
      messages: [{
        role: "user",
        content: [
          { type: "text", text: "Extract every product from this catalogue." },
          { type: "file", filename: up.file_name, data: base64, mediaType: "application/pdf" },
        ],
      }],
      abortSignal: req.signal,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
      onError: ({ error }) => {
        const e = error as { statusCode?: number; message?: string };
        failure = { status: e.statusCode ?? 500, message: e.message ?? "AI request failed" };
      },
    });
    text = await result.text;
  } catch (err) {
    const e = err as { statusCode?: number };
    failure ??= { status: e.statusCode ?? 500, message: "AI request failed" };
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
