import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseStatus } from "@tanstack/react-start/server";
import { z } from "zod";
import { redditClickMatch } from "@/lib/reddit-click-id";

const PIXEL_ID = "a2_jykx84cbgi9e";
const Body = z.object({
  conversionId: z.string().min(1).max(100),
  submissionId: z.string().uuid(),
  clickId: z.string().max(500).optional(),
  screen: z.object({ width: z.number().int().positive(), height: z.number().int().positive() }).optional(),
}).strict();

async function sha256(value: string) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export const reportRedditLead = createServerFn({ method: "POST" })
  .inputValidator(Body)
  .handler(async ({ data }) => {
    const { conversionId, submissionId, clickId, screen } = data;
    const token = process.env["REDDIT_CAPI_TOKEN"];
    if (!token) {
      setResponseStatus(500);
      throw new Error("not configured");
    }

    // The unguessable saved-enquiry ID authorizes this one-hour reporting window.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: row } = await supabaseAdmin.from("requirement_submissions").select("contact").eq("id", submissionId)
      .gte("created_at", since).maybeSingle();
    if (!row) return { ok: false };
    const phone = String(row.contact ?? "");
    const digits = phone.replace(/\D/g, "").slice(-10);
    if (digits.length < 6) return { ok: false };

    const e164 = digits.length === 10 ? `+91${digits}` : `+${phone.replace(/\D/g, "")}`;
    const request = getRequest();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const event = {
      event_at: new Date().toISOString(),
      event_type: { tracking_type: "Lead" },
      ...redditClickMatch(clickId),
      event_metadata: { conversion_id: conversionId },
      user: {
        phone_number: await sha256(e164),
        ...(ip ? { ip_address: await sha256(ip) } : {}),
        user_agent: request.headers.get("user-agent") ?? undefined,
        ...(screen ? { screen_dimensions: screen } : {}),
      },
    };
    const response = await fetch(`https://ads-api.reddit.com/api/v2.0/conversions/events/${PIXEL_ID}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ test_mode: false, events: [event] }),
    });
    if (!response.ok) {
      console.error("Reddit CAPI error", response.status, await response.text());
      setResponseStatus(502);
      throw new Error("reddit rejected event");
    }
    return { ok: true };
  });
