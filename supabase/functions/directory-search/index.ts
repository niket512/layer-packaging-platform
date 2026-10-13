import { createOpenAI } from "npm:@ai-sdk/openai";
import { streamText } from "npm:ai";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "../_shared/run-id.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const SYSTEM = `You match a packaging buyer's request to manufacturers in a directory.
Use ONLY the supplied manufacturer data. Never invent facts.
Return JSON: {"matches":[{"id": string, "reason": string}]} ordered best first.
Include only manufacturers that plausibly fit (category, product, location, MOQ, lead time). reason: one short sentence (max 20 words) citing facts from the data. Return an empty list if none fit.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json({ error: "AI is not configured" }, 500);
  let body: { query?: string; manufacturers?: unknown[] };
  try { body = await req.json(); } catch { return json({ error: "Invalid request" }, 400); }
  const query = typeof body.query === "string" ? body.query.trim().slice(0, 500) : "";
  if (!query || !Array.isArray(body.manufacturers) || !body.manufacturers.length) return json({ error: "Invalid request" }, 400);

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(req));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  let failure: { status: number; message: string } | null = null;
  try {
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system: SYSTEM,
      prompt: JSON.stringify({ request: query, manufacturers: body.manufacturers.slice(0, 200) }).slice(0, 30000),
      abortSignal: req.signal,
      providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
      onError: ({ error }) => {
        const e = error as { statusCode?: number; message?: string };
        failure = { status: e.statusCode ?? 500, message: e.message ?? "AI request failed" };
      },
    });
    const text = await result.text;
    if (failure) throw failure;
    const m = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(m ? m[0] : text);
    const headers: Record<string, string> = {};
    const runId = runIdFetch.getRunId();
    if (runId) headers["X-Lovable-AIG-Run-ID"] = runId;
    return new Response(JSON.stringify({ matches: Array.isArray(parsed.matches) ? parsed.matches : [] }), { headers: { ...cors, ...headers, "Content-Type": "application/json" } });
  } catch (err) {
    const e = (failure ?? err) as { status?: number; statusCode?: number; message?: string };
    const status = e.status ?? e.statusCode ?? 500;
    const message = status === 402 ? "AI credits have run out — add credits in Settings → Plans & credits"
      : status === 429 ? "AI is busy right now, please try again in a minute"
      : status === 403 ? e.message ?? "AI access is blocked" : "AI search failed, please try again";
    return json({ error: message }, status);
  }
});
