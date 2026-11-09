import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import { funnelOutcome, type FunnelStep, type VisitorReportRow } from "@/lib/visitor-metrics";
import { SessionJourney, journeyLabel } from "./SessionJourney";
import { journeyFields } from "@/lib/visitor-metrics";

const transitions: [string, FunnelStep, FunnelStep][] = [
  ["Start a chat", "page_opened", "first_message"],
  ["Answer packaging questions", "questions_shown", "questions_answered"],
  ["Reply to the design question", "design_shown", "design_answered"],
  ["Share contact number", "contact_shown", "contact_submitted"],
  ["Save the request", "contact_submitted", "request_saved"],
];
export function VisitorAnalytics({ sessionId }: { sessionId?: string | null }) {
  const [chosen, setChosen] = useState<string | null>(null);
  useEffect(() => { if (sessionId) setChosen(sessionId); }, [sessionId]);
  const [rows, setRows] = useState<VisitorReportRow[]>([]);
  const [days, setDays] = useState("7");
  const [device, setDevice] = useState("all");
  const [source, setSource] = useState("all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = async () => {
    setBusy(true);
    const { data, error: reportError } = await supabase.rpc("visitor_behaviour_report", { _days: Number(days) });
    if (reportError) setError("Couldn’t load visitor activity. Please refresh.");
    else { setRows((data as unknown as { sessions: VisitorReportRow[] })?.sessions ?? []); setError(""); }
    setBusy(false);
  };
  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);
  const filtered = rows.filter(row => (device === "all" || row.device === device) && (source === "all" || row.source === source));
  const sourcing = filtered.filter(row => row.steps.page_opened !== undefined);
  const sum = (key: "viewed" | "opened" | "selected") => filtered.reduce((total, row) => total + row[key], 0);
  return <section aria-label="Visitor activity" className="mb-6 border-y border-border py-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Visitor activity</h2><div className="flex flex-wrap gap-2">
      <Select value={days} onValueChange={setDays}><SelectTrigger aria-label="Activity period" className="w-36"><SelectValue /></SelectTrigger><SelectContent>{[7, 30, 90].map(day => <SelectItem key={day} value={String(day)}>Last {day} days</SelectItem>)}</SelectContent></Select>
      <Select value={device} onValueChange={setDevice}><SelectTrigger aria-label="Device filter" className="w-32"><SelectValue /></SelectTrigger><SelectContent>{["all", "mobile", "tablet", "desktop"].map(value => <SelectItem key={value} value={value}>{value === "all" ? "All devices" : value}</SelectItem>)}</SelectContent></Select>
      <Select value={source} onValueChange={setSource}><SelectTrigger aria-label="Traffic filter" className="w-40"><SelectValue /></SelectTrigger><SelectContent>{["all", "direct", "paid_search", "organic_search", "social", "referral", "email", "other_campaign"].map(value => <SelectItem key={value} value={value}>{value === "all" ? "All traffic" : value.replace(/_/g, " ")}</SelectItem>)}</SelectContent></Select>
      <Button variant="outline" size="icon" disabled={busy} aria-label="Refresh visitor activity" onClick={() => void refresh()}><RefreshCw className={busy ? "animate-spin" : ""} /></Button>
    </div></div>
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    <dl className="my-5 grid grid-cols-2 gap-4 sm:grid-cols-4">{[["Visits", filtered.length], ["Designs viewed", sum("viewed")], ["Details opened", sum("opened")], ["Designs selected", sum("selected")]].map(([label, count]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-2xl font-semibold">{count}</dd></div>)}</dl>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border text-xs text-muted-foreground"><tr><th className="py-2">Step</th><th className="px-3">Reached</th><th className="px-3">Continued</th><th className="px-3">Not yet continued</th></tr></thead><tbody>{transitions.map(([label, from, to]) => {
      const result = funnelOutcome(sourcing, from, to);
      const skipped = from === "questions_shown" ? sourcing.filter(row => row.steps.questions_shown !== undefined && row.steps.questions_skipped !== undefined && row.steps.questions_answered === undefined).length : 0;
      return <tr key={from} className="border-b border-border/60"><td className="py-3 font-medium">{label}{skipped > 0 && <span className="block text-xs font-normal text-muted-foreground">{skipped} skipped optional questions</span>}</td><td className="px-3">{result.reached}</td><td className="px-3">{result.continued + skipped}</td><td className="px-3">{result.notYet - skipped}{result.reached > 0 && <span className="ml-2 text-xs text-muted-foreground">({Math.round((result.notYet - skipped) / result.reached * 100)}%)</span>}</td></tr>;
    })}</tbody></table></div>
    <h3 className="mt-5 text-sm font-semibold">Scroll reach</h3><div className="mt-2 overflow-x-auto"><table className="w-full text-left text-xs"><thead className="text-muted-foreground"><tr><th className="py-2">Page</th>{[25,50,75,100].map(depth => <th key={depth} className="px-3">{depth}%</th>)}</tr></thead><tbody>{["/", "/sourcing", "/designs", "/designs/flexible-pouches"].map(path => <tr key={path} className="border-t border-border"><td className="py-2">{path}</td>{[25,50,75,100].map(depth => <td key={depth} className="px-3">{filtered.filter(row => (row.scroll_depth[path] ?? 0) >= depth).length}</td>)}</tr>)}</tbody></table></div>
    <h3 className="mt-5 text-sm font-semibold">Individual session journeys ({filtered.length})</h3>
    <div className="mt-3 max-h-72 overflow-auto"><table className="w-full text-left text-xs"><thead className="text-muted-foreground"><tr><th className="py-2">Session / started (IST)</th><th>Device / source</th><th>Last observed action</th><th>Filled fields</th><th>Viewed / opened / selected</th></tr></thead><tbody>{filtered.map(row => <tr key={row.id} className="border-t border-border"><td className="py-2"><Button variant="link" size="sm" className="h-auto px-0" onClick={() => setChosen(row.id)}>Session {row.id.slice(0, 8)}</Button><span className="block">{new Date(row.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span></td><td>{row.device} / {row.source.replace(/_/g, " ")}</td><td>{row.journey?.at(-1) ? journeyLabel(row.journey[row.journey.length - 1]) : Object.entries(row.steps).sort((a,b) => Number(b[1]) - Number(a[1]))[0]?.[0].replace(/_/g, " ") ?? "Design browsing"}</td><td>{row.journey?.length ? journeyFields(row.journey).length : "Not recorded"}</td><td>{row.viewed} / {row.opened} / {row.selected}</td></tr>)}</tbody></table></div>
    {rows.find(row => row.id === chosen) && <SessionJourney row={rows.find(row => row.id === chosen) as VisitorReportRow} />}
    {chosen && !rows.some(row => row.id === chosen) && <p className="mt-3 text-sm text-muted-foreground">This chat’s session is not in the selected period. Choose a longer period.</p>}
    <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Measurement starts with this update; past visits cannot be recovered. Visits reset after 30 minutes of inactivity. “Not yet continued” includes active visitors, not confirmed exits. Optional questions and designs may be bypassed. Design views count unique cards at least half visible for one second, not automatically loaded cards. Scroll reach uses each page’s scrollable height and may vary as designs load. Messages, photos and phone numbers are excluded.</p>
  </section>;
}