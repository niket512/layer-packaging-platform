import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseStatus } from "@tanstack/react-start/server";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "@/lib/ai-gateway-run-id";

const DRAFT_SYSTEM = `You are a procurement assistant for early-stage Indian D2C founders.
Turn the founder's short ask into a complete request for quote.
Reply with ONLY a JSON object, no markdown, with keys:
title (short), category (short), description (2-3 sentences), specs (bullet lines separated by \\n covering material, dimensions, finish, printing, packaging, compliance and anything a supplier needs to quote accurately; mark assumptions with "(confirm)"), quantity (number or null), unit (string), target_price (number in INR per unit or null).
Keep specs under 12 lines.`;

const COMPARE_SYSTEM = `You are a procurement analyst helping an early-stage founder pick a supplier quote.
Given an RFQ and supplier quotes, write a concise markdown answer under 220 words with:
**Recommendation** (one supplier and why), **Comparison** (short bullets on price, MOQ, lead time, terms), **Risks to check** (missing info, outlier pricing, long lead times, MOQ above requested quantity), **Negotiation tips** (1-3 bullets).
Prices are INR. Do not invent facts that are not in the data.`;

const Body = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("draft_rfq"), ask: z.string().trim().min(1).max(2000) }).strict(),
  z.object({
    mode: z.literal("compare"),
    rfq: z.record(z.unknown()),
    quotes: z.array(z.unknown()).min(1).max(100),
  }).strict(),
]);

export type ProcureAiInput = z.input<typeof Body>;
type AiFailure = { status: number; message: string };

export const procureAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(Body)
  .handler(async ({ data: body }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      setResponseStatus(500);
      throw new Error("AI is not configured");
    }
    const request = getRequest();
    const system = body.mode === "draft_rfq" ? DRAFT_SYSTEM : COMPARE_SYSTEM;
    const prompt = body.mode === "draft_rfq"
      ? body.ask
      : JSON.stringify({ rfq: body.rfq, quotes: body.quotes }).slice(0, 12000);
    const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: runIdFetch.fetch,
    });
    let failure: AiFailure | null = null;
    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        instructions: system,
        prompt,
        abortSignal: request.signal,
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
      if (body.mode === "draft_rfq") {
        const match = text.match(/\{[\s\S]*\}/);
        try {
          const parsed = JSON.parse(match ? match[0] : text) as unknown;
          if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid draft");
          const draft = Object.fromEntries(Object.entries(parsed).flatMap(([key, value]) =>
            typeof value === "string" || typeof value === "number" || value === null ? [[key, value]] : [],
          ));
          return { draft };
        } catch {
          setResponseStatus(502);
          throw new Error("AI returned an unreadable draft, please try again");
        }
      }
      return { analysis: text };
    } catch (error) {
      if (error instanceof Error && error.message === "AI returned an unreadable draft, please try again") throw error;
      const e = (failure ?? error) as { status?: number; statusCode?: number; message?: string };
      const status = e.status ?? e.statusCode ?? 500;
      const message = status === 402
        ? "AI credits have run out — add credits in Settings → Plans & credits"
        : status === 429
          ? "AI is busy right now, please try again in a minute"
          : status === 403
            ? e.message ?? "AI access is blocked for this workspace"
            : "AI request failed, please try again";
      setResponseStatus(status);
      throw new Error(message);
    }
  });
