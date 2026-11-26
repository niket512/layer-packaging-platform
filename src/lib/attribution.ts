/** First-touch ad attribution, kept on the device so it survives refreshes and internal navigation. */
export type Attribution = Record<string, string>;
const KEY = "snaplogo.attribution";
const PARAMS: Record<string, string> = {
  gclid: "gclid", gbraid: "gbraid", wbraid: "wbraid", campaignid: "campaign_id", utm_id: "campaign_id", campaign: "campaign_name",
  adgroupid: "ad_group_id", adgroup: "ad_group", keyword: "keyword", matchtype: "match_type", searchterm: "search_term", search_term: "search_term",
  network: "network", device: "ad_device", utm_source: "utm_source", utm_medium: "utm_medium", utm_campaign: "utm_campaign", utm_content: "utm_content", utm_term: "utm_term",
};
const AD_KEYS = ["gclid", "gbraid", "wbraid", "utm_source", "utm_medium", "utm_campaign", "campaign_id"];

export function attributionFromUrl(search: string, context: { landing: string; referrer: string; device: string; now: string }): Attribution | null {
  const params = new URLSearchParams(search);
  const found: Attribution = {};
  for (const [param, key] of Object.entries(PARAMS)) {
    const value = params.get(param)?.trim();
    if (value && !/[{}]/.test(value) && !found[key]) found[key] = value.slice(0, 200);
  }
  // ValueTrack supplies the matched advertising keyword, not the user's actual search query.
  if (!found["keyword"] && found["utm_term"]) found["keyword"] = found["utm_term"];
  if (!Object.keys(found).some(key => AD_KEYS.includes(key) || key === "keyword")) return null;
  return { ...found, landing_page: context.landing.slice(0, 300), referrer: context.referrer.slice(0, 300), device: context.device, first_seen: context.now };
}

/** A new ad click replaces earlier attribution; plain internal or direct visits never overwrite it. */
export function nextAttribution(saved: Attribution | null, fromUrl: Attribution | null, context: { landing: string; referrer: string; device: string; now: string }, sameSite: boolean): Attribution {
  if (fromUrl) return fromUrl;
  if (saved) return saved;
  return { landing_page: context.landing.slice(0, 300), referrer: sameSite ? "" : context.referrer.slice(0, 300), device: context.device, first_seen: context.now };
}

export function captureAttribution(): Attribution {
  const context = { landing: location.pathname + location.search, referrer: document.referrer, device: window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop", now: new Date().toISOString() };
  let saved: Attribution | null = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) ?? "null"); } catch { /* fresh */ }
  const sameSite = Boolean(document.referrer) && document.referrer.startsWith(location.origin);
  const next = nextAttribution(saved, attributionFromUrl(location.search, context), context, sameSite);
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* in-memory only */ }
  return next;
}

export function readAttribution(): Attribution | null {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "null"); } catch { return null; }
}
