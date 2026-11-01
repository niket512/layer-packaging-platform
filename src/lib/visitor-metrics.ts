export const FUNNEL_STEPS = ["page_opened", "first_message", "questions_shown", "questions_answered", "questions_skipped", "design_shown", "design_answered", "brief_shown", "contact_shown", "contact_submitted", "request_saved"] as const;
export type FunnelStep = typeof FUNNEL_STEPS[number];
export type VisitorSnapshot = {
  device: "mobile" | "tablet" | "desktop";
  source: "direct" | "paid_search" | "organic_search" | "social" | "referral" | "email" | "other_campaign";
  steps: Partial<Record<FunnelStep, number>>;
  scroll_depth: Record<string, number>;
  viewed_designs: string[];
  opened_designs: string[];
  selected_designs: string[];
};
export function scrollDepth(top: number, height: number, viewport: number) {
  if (height <= viewport || top <= 0) return 0;
  return Math.min(100, Math.floor(top / (height - viewport) * 100));
}
export function addDesign(snapshot: VisitorSnapshot, kind: "viewed" | "opened" | "selected", id: string) {
  const key = `${kind}_designs` as const;
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id) || snapshot[key].includes(id) || snapshot[key].length >= 1000) return false;
  snapshot[key].push(id);
  return true;
}
export function trafficSource(search: string, referrer: string, origin: string): VisitorSnapshot["source"] {
  const params = new URLSearchParams(search);
  const medium = params.get("utm_medium")?.toLowerCase();
  if (params.has("gclid") || params.has("gbraid") || params.has("wbraid") || ["cpc", "ppc", "paidsearch"].includes(medium ?? "")) return "paid_search";
  if (medium === "email") return "email";
  if (medium?.includes("social")) return "social";
  if (medium || params.has("utm_source")) return "other_campaign";
  try {
    const url = new URL(referrer);
    if (url.origin === origin) return "direct";
    if (/(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|yahoo\.com)$/.test(url.hostname)) return "organic_search";
    if (/(^|\.)(facebook\.com|instagram\.com|linkedin\.com|t\.co)$/.test(url.hostname)) return "social";
    return "referral";
  } catch { return "direct"; }
}
export type VisitorReportRow = { id: string; created_at: string; updated_at: string; device: string; source: string; steps: VisitorSnapshot["steps"]; scroll_depth: Record<string, number>; viewed: number; opened: number; selected: number };
export function funnelOutcome(rows: VisitorReportRow[], from: FunnelStep, to: FunnelStep) {
  const eligible = rows.filter(row => row.steps[from] !== undefined);
  const continued = eligible.filter(row => row.steps[to] !== undefined).length;
  return { reached: eligible.length, continued, notYet: eligible.length - continued };
}