import { createOpenAI } from "npm:@ai-sdk/openai";
import { streamText } from "npm:ai";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
} from "../_shared/run-id.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const DRAFT_SYSTEM = `You are a procurement assistant for early-stage Indian D2C founders.
Turn the founder's short ask into a complete request for quote.
Reply with ONLY a JSON object, no markdown, with keys:
title (short), category (short), description (2-3 sentences), specs (bullet lines separated by \\n covering material, dimensions, finish, printing, packaging, compliance and anything a supplier needs to quote accurately; mark assumptions with "(confirm)"), quantity (number or null), unit (string), target_price (number in INR per unit or null).
Keep specs under 12 lines.`;

const COMPARE_SYSTEM = `You are a procurement analyst helping an early-stage founder pick a supplier quote.
Given an RFQ and supplier quotes, write a concise markdown answer under 220 words with:
**Recommendation** (one supplier and why), **Comparison** (short bullets on price, MOQ, lead time, terms), **Risks to check** (missing info, outlier pricing, long lead times, MOQ above requested quantity), **Negotiation tips** (1-3 bullets).
Prices are INR. Do not invent facts that are not in the data.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const auth = req.headers.get("Authorization") ?? "";
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return json({ error: "Please sign in to use AI features" }, 401);

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json({ error: "AI is not configured" }, 500);

  let body: { mode?: string; ask?: string; rfq?: unknown; quotes?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  let system: string;
  let prompt: string;
  if (body.mode === "draft_rfq" && typeof body.ask === "string" && body.ask.trim()) {
    system = DRAFT_SYSTEM;
    prompt = body.ask.slice(0, 2000);
  } else if (body.mode === "compare" && body.rfq && Array.isArray(body.quotes) && body.quotes.length) {
    system = COMPARE_SYSTEM;
    prompt = JSON.stringify({ rfq: body.rfq, quotes: body.quotes }).slice(0, 12000);
  } else {
    return json({ error: "Invalid request" }, 400);
  }

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
      system,
      prompt,
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
    const text = await result.text;
    if (failure) throw failure;
    const headers: Record<string, string> = {};
    const runId = runIdFetch.getRunId();
    if (runId) headers["X-Lovable-AIG-Run-ID"] = runId;

    if (body.mode === "draft_rfq") {
      const match = text.match(/\{[\s\S]*\}/);
      try {
        const draft = JSON.parse(match ? match[0] : text);
        return new Response(JSON.stringify({ draft }), { headers: { ...cors, ...headers, "Content-Type": "application/json" } });
      } catch {
        return json({ error: "AI returned an unreadable draft, please try again" }, 502);
      }
    }
    return new Response(JSON.stringify({ analysis: text }), { headers: { ...cors, ...headers, "Content-Type": "application/json" } });
  } catch (err) {
    const e = (failure ?? err) as { status?: number; statusCode?: number; message?: string };
    const status = e.status ?? e.statusCode ?? 500;
    const message =
      status === 402
        ? "AI credits have run out — add credits in Settings → Plans & credits"
        : status === 429
          ? "AI is busy right now, please try again in a minute"
          : status === 403
            ? e.message ?? "AI access is blocked for this workspace"
            : "AI request failed, please try again";
    return json({ error: message }, status);
  }
});
