import { useEffect } from "react";
import { trafficSource } from "./visitor-metrics";

/** Landing-page (/lp/*) tracking: one visitor_behaviour row per session, written through save_lp_behaviour. */
export type LpVersion = "a" | "b";
export type LpEventName = "page_view" | "first_interaction" | "scroll_depth" | "section_viewed" | "cta_click" | "box_selected" | "step_viewed" | "field_focus" | "field_done" | "field_error" | "submit_attempt" | "submit_success" | "submit_fail" | "whatsapp_click" | "call_click" | "heartbeat" | "page_hidden";
type Props = Record<string, string | number | boolean>;
type LpStep = "page_opened" | "brief_shown" | "contact_shown" | "contact_submitted" | "request_saved";
type LpSession = {
  id: string; token: string; version: LpVersion; internal: boolean; revision: number;
  device: "mobile" | "tablet" | "desktop"; source: string; steps: Partial<Record<LpStep, number>>;
  events: (Props & { name: LpEventName; t: number; v: LpVersion })[]; perf: Record<string, number>; attribution: Record<string, string>;
};
const KEY = "snaplogo.lp.session";
const PARAMS_KEY = "snaplogo.lp.params";
const KEPT = ["gclid", "gbraid", "wbraid", "kw", "mt", "net", "dev", "cmp", "adg", "ad", "test"];
let session: LpSession | undefined;
let timer: number | undefined;

/** Ad/UTM params from the URL, merged over earlier ones from this session, so they survive to the thank-you page. */
export function lpParams(search = typeof location === "undefined" ? "" : location.search): Record<string, string> {
  let saved: Record<string, string> = {};
  try { saved = JSON.parse(sessionStorage.getItem(PARAMS_KEY) ?? "{}") ?? {}; } catch { /* fresh */ }
  const found: Record<string, string> = {};
  new URLSearchParams(search).forEach((value, key) => {
    if ((KEPT.includes(key) || key.startsWith("utm_")) && value.trim() && !/[{}]/.test(value)) found[key] = value.trim().slice(0, 200);
  });
  const next = Object.keys(found).length ? { ...saved, ...found } : saved;
  try { sessionStorage.setItem(PARAMS_KEY, JSON.stringify(next)); } catch { /* memory only */ }
  return next;
}
export const isInternal = (params: Record<string, string>) => params["test"] === "1" || params["utm_source"]?.toLowerCase() === "internal";
export const lpQuery = () => { const p = new URLSearchParams(lpParams()).toString(); return p ? `?${p}` : ""; };

function current(version?: LpVersion): LpSession {
  if (!session) {
    try { const saved = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as LpSession | null; if (saved?.id && saved.token) session = saved; } catch { /* fresh */ }
  }
  const params = lpParams();
  if (!session) {
    const w = window.innerWidth;
    session = { id: crypto.randomUUID(), token: crypto.randomUUID(), version: version ?? "a", internal: false, revision: 0,
      device: w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop", source: trafficSource(location.search, document.referrer, location.origin),
      steps: {}, events: [], perf: {}, attribution: {} };
  }
  session.internal = session.internal || isInternal(params);
  session.attribution = { ...params, landing_page: (session.attribution["landing_page"] ?? location.pathname + location.search).slice(0, 300), referrer: (session.attribution["referrer"] ?? document.referrer).slice(0, 300) };
  return session;
}
function persist() { try { if (session) sessionStorage.setItem(KEY, JSON.stringify(session)); } catch { /* memory only */ } }
function schedule() { persist(); if (timer === undefined) timer = window.setTimeout(() => { timer = undefined; void flushLp(); }, 1500); }

export async function flushLp() {
  if (!session) return;
  session.revision = Math.max(session.revision + 1, Date.now());
  persist();
  const s = session;
  try {
    await fetch(`${import.meta.env["VITE_SUPABASE_URL"]}/rest/v1/rpc/save_lp_behaviour`, {
      method: "POST", keepalive: true,
      headers: { "Content-Type": "application/json", apikey: import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"], Authorization: `Bearer ${import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]}` },
      body: JSON.stringify({ _id: s.id, _token: s.token, _revision: s.revision, _snapshot: { version: s.version, internal: s.internal, device: s.device, source: s.source, steps: s.steps, events: s.events.slice(-1500), perf: s.perf, attribution: s.attribution } }),
    });
  } catch { /* next flush retries */ }
}
export function lpTrack(name: LpEventName, props: Props = {}) {
  try {
    const s = current();
    if (s.events.length >= 1500) return;
    s.events.push({ ...props, name, t: Date.now(), v: s.version });
    schedule();
  } catch { /* tracking never blocks the page */ }
}
export function lpStep(step: LpStep) {
  try { const s = current(); if (s.steps[step] === undefined) { s.steps[step] = Date.now(); schedule(); } } catch { /* ignore */ }
}
export const lpSessionId = () => { try { return current().id; } catch { return null; } };
export const lpSession = () => { try { return current(); } catch { return null; } };

/** Page-level events: view, first interaction, scroll depth, sections, heartbeat, hide, and web-vitals. */
export function useLpTracking(version: LpVersion, page: string, lastStep: () => string) {
  useEffect(() => {
    const s = current(version);
    s.version = version;
    const loaded = performance.now();
    lpTrack("page_view", { page });
    lpStep("page_opened");
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav) s.perf["ttfb"] = Math.round(nav.responseStart);
    const fcp = performance.getEntriesByName("first-contentful-paint")[0];
    if (fcp) s.perf["fcp"] = Math.round(fcp.startTime);
    const observers: PerformanceObserver[] = [];
    const observe = (type: string, cb: (list: PerformanceObserverEntryList) => void) => {
      try { const o = new PerformanceObserver(cb); o.observe({ type, buffered: true }); observers.push(o); } catch { /* unsupported */ }
    };
    observe("paint", l => { for (const e of l.getEntries()) if (e.name === "first-contentful-paint") s.perf["fcp"] = Math.round(e.startTime); });
    observe("largest-contentful-paint", l => { const last = l.getEntries().at(-1); if (last) s.perf["lcp"] = Math.round(last.startTime); });
    let cls = 0;
    observe("layout-shift", l => { for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!e.hadRecentInput) cls += e.value; s.perf["cls"] = Math.round(cls * 1000) / 1000; });

    let interacted = false;
    const onInteract = () => { if (interacted) return; interacted = true; lpTrack("first_interaction", { seconds: Math.round((performance.now() - loaded) / 100) / 10 }); };
    const marks = new Set<number>();
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h <= 0 ? 100 : Math.round((window.scrollY / h) * 100);
      for (const m of [25, 50, 75, 100]) if (pct >= m && !marks.has(m)) { marks.add(m); lpTrack("scroll_depth", { percent: m }); }
    };
    const seen = new Set<string>();
    const io = new IntersectionObserver(entries => { for (const e of entries) { const id = (e.target as HTMLElement).dataset["lpSection"]; if (e.isIntersecting && id && !seen.has(id)) { seen.add(id); lpTrack("section_viewed", { section: id }); } } }, { threshold: 0.3 });
    document.querySelectorAll("[data-lp-section]").forEach(el => io.observe(el));
    const beat = window.setInterval(() => { if (document.visibilityState === "visible") lpTrack("heartbeat", { seconds: Math.round((performance.now() - loaded) / 1000) }); }, 15000);
    const onHide = () => {
      if (document.visibilityState !== "hidden") return;
      lpTrack("page_hidden", { time_on_page: Math.round((performance.now() - loaded) / 1000), last_step: lastStep() });
      void flushLp();
    };
    window.addEventListener("pointerdown", onInteract, { passive: true });
    window.addEventListener("keydown", onInteract);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onHide);
    return () => {
      observers.forEach(o => o.disconnect()); io.disconnect(); window.clearInterval(beat);
      window.removeEventListener("pointerdown", onInteract); window.removeEventListener("keydown", onInteract);
      window.removeEventListener("scroll", onScroll); document.removeEventListener("visibilitychange", onHide);
      void flushLp();
    };
  }, [version, page]); // eslint-disable-line react-hooks/exhaustive-deps
}
