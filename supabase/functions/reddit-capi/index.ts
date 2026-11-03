import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const PIXEL_ID = "a2_jykx84cbgi9e";
const Body = z.object({
  conversionId: z.string().min(1).max(100),
  phone: z.string().min(6).max(40),
  clickId: z.string().max(500).optional(),
  screen: z.object({ width: z.number().int().positive(), height: z.number().int().positive() }).optional(),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function sha256(value: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "invalid request" }, 400);
  const { conversionId, phone, clickId, screen } = parsed.data;
  const token = Deno.env.get("REDDIT_CAPI_TOKEN");
  if (!token) return json({ error: "not configured" }, 500);

  // Only report leads that were actually saved in the last hour.
  const digits = phone.replace(/\D/g, "").slice(-10);
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data } = await db.from("requirement_submissions").select("id").gte("created_at", since)
    .ilike("contact", `%${digits}%`).limit(1);
  if (!data?.length) return json({ error: "no saved enquiry" }, 404);

  const e164 = digits.length === 10 ? `+91${digits}` : `+${phone.replace(/\D/g, "")}`;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim();
  const event = {
    event_at: new Date().toISOString(),
    event_type: { tracking_type: "Lead" },
    ...(clickId ? { click_id: clickId } : {}),
    event_metadata: { conversion_id: conversionId },
    user: {
      phone_number: await sha256(e164),
      ...(ip ? { ip_address: await sha256(ip) } : {}),
      user_agent: req.headers.get("user-agent") ?? undefined,
      ...(screen ? { screen_dimensions: screen } : {}),
    },
  };
  const res = await fetch(`https://ads-api.reddit.com/api/v2.0/conversions/events/${PIXEL_ID}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ test_mode: false, events: [event] }),
  });
  if (!res.ok) {
    console.error("Reddit CAPI error", res.status, await res.text());
    return json({ error: "reddit rejected event" }, 502);
  }
  return json({ ok: true });
});
