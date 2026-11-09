import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { addDesign, addJourney, JOURNEY_FIELDS, scrollDepth, trafficSource, type FunnelStep, type JourneyEvent, type VisitorSnapshot } from "./visitor-metrics";

const KEY = "snaplogo.visitor.session";
const trackedPath = (pathname: string) => ["/", "/request-form", "/sourcing", "/designs", "/designs/flexible-pouches", "/designs/corrugated-boxes"].includes(pathname);
type Session = { id: string; token: string; last: number; snapshot: VisitorSnapshot };
let session: Session | undefined;
let timer: number | undefined;
let dirty = false;
function current() {
  if (session && Date.now() - session.last < 30 * 60 * 1000) return session;
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as Session | null;
    if (saved?.id && saved.token && saved.snapshot && Date.now() - saved.last < 30 * 60 * 1000) session = saved;
    else session = undefined;
  } catch { session = undefined; }
  session ??= { id: crypto.randomUUID(), token: crypto.randomUUID(), last: Date.now(), snapshot: {
    device: window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop",
    source: trafficSource(location.search, document.referrer, location.origin), steps: {}, scroll_depth: {}, viewed_designs: [], opened_designs: [], selected_designs: [], journey: [],
  } };
  return session;
}
function changed() {
  const active = current();
  active.last = Date.now();
  try { sessionStorage.setItem(KEY, JSON.stringify(active)); } catch { /* In-memory tracking remains usable. */ }
  dirty = true;
  if (timer === undefined) timer = window.setTimeout(() => { timer = undefined; void flushVisitorTracking(); }, 1500);
}
export async function flushVisitorTracking() {
  if (!dirty || !session) return;
  dirty = false;
  const revision = Date.now();
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/save_visitor_behaviour`, {
      method: "POST", keepalive: true,
      headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      body: JSON.stringify({ _id: session.id, _token: session.token, _revision: revision, _snapshot: session.snapshot }),
    });
    if (!response.ok) dirty = true;
  } catch { dirty = true; }
}
export function trackFunnel(step: FunnelStep) {
  const active = current();
  if (active.snapshot.steps[step] !== undefined) return;
  active.snapshot.steps[step] = Date.now();
  trackJourney({ kind: "funnel", step });
  changed();
  const target = window as Window & { dataLayer?: unknown[] };
  target.dataLayer ??= [];
  target.dataLayer.push({ event: "sourcing_funnel_step", step });
}
export function trackJourney(event: Omit<JourneyEvent, "at" | "path">) {
  if (!trackedPath(location.pathname)) return;
  if (addJourney(current().snapshot, { ...event, at: Date.now(), path: location.pathname })) changed();
}
export function trackFormField(field: string, filled: boolean, step: number) {
  const known = JOURNEY_FIELDS.find(value => value === field);
  if (known) trackJourney({ kind: "field", field: known, filled, step: String(step + 1) });
}
export function trackDesign(kind: "viewed" | "opened" | "selected", id: string, context?: { position?: number; family?: "boxes" | "pouches"; category?: string }) {
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id)) return;
  if (addDesign(current().snapshot, kind, id)) changed();
  trackJourney({ kind, design: id, ...context });
}
export function currentVisitorSessionId(): string | null {
  try { return current().id; } catch { return null; }
}
export function useVisitorTracking() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!trackedPath(pathname) || /^(app|manufacturers|makers)\./.test(location.hostname)) return;
    trackJourney({ kind: "page" });
    if (pathname === "/" || pathname === "/request-form" || pathname.startsWith("/sourcing")) trackFunnel("page_opened");
    else changed();
    const onScroll = () => {
      const active = current();
      const depth = scrollDepth(window.scrollY, document.documentElement.scrollHeight, window.innerHeight);
      if (depth > (active.snapshot.scroll_depth[pathname] ?? 0)) { active.snapshot.scroll_depth[pathname] = depth; changed(); }
    };
    const onHide = () => { if (document.visibilityState === "hidden") void flushVisitorTracking(); };
    const retry = window.setInterval(() => void flushVisitorTracking(), 15000);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", flushVisitorTracking);
    document.addEventListener("visibilitychange", onHide);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("pagehide", flushVisitorTracking); document.removeEventListener("visibilitychange", onHide); window.clearInterval(retry); void flushVisitorTracking(); };
  }, [pathname]);
}