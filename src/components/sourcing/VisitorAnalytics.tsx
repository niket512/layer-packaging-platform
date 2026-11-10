import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import { type VisitorReportRow } from "@/lib/visitor-metrics";
import { inIndiaToday } from "@/lib/visitor-funnel";
import { FullVisitorFunnel } from "./FullVisitorFunnel";
import { SessionJourney, journeyLabel } from "./SessionJourney";
import { journeyFields } from "@/lib/visitor-metrics";
import { inAdminDateRange, type AdminDateRange } from "@/lib/admin-date-range";

export function VisitorAnalytics({ sessionId, dateRange = { from: "", to: "" } }: { sessionId?: string | null; dateRange?: AdminDateRange }) {
  const customDates = Boolean(dateRange.from || dateRange.to);
  const [chosen, setChosen] = useState<string | null>(null);
  const [inspection, setInspection] = useState<{ label: string; ids: string[] } | null>(null);
  useEffect(() => { if (sessionId) setChosen(sessionId); }, [sessionId]);
  const [rows, setRows] = useState<VisitorReportRow[]>([]);
  const [days, setDays] = useState("7");
  const [device, setDevice] = useState("all");
  const [source, setSource] = useState("all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = async () => {
    setBusy(true);
    const { data, error: reportError } = await supabase.rpc("visitor_behaviour_report", { _days: customDates ? 90 : days === "today" ? 2 : Number(days) });
    if (reportError) setError("Couldn’t load visitor activity. Please refresh.");
    else { setRows((data as unknown as { sessions: VisitorReportRow[] })?.sessions ?? []); setError(""); }
    setBusy(false);
  };
  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, customDates]);
  useEffect(() => { setInspection(null); setChosen(null); }, [dateRange.from, dateRange.to]);
  const filtered = rows.filter(row => (customDates ? inAdminDateRange(row.created_at, dateRange) : days !== "today" || inIndiaToday(row)) && (device === "all" || row.device === device) && (source === "all" || row.source === source));
  const sessionRows = inspection ? filtered.filter(row => inspection.ids.includes(row.id)) : filtered;
  const sum = (key: "viewed" | "opened" | "selected") => filtered.reduce((total, row) => total + row[key], 0);
  return <section aria-label="Visitor activity" className="mb-6 border-y border-border py-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Visitor activity</h2><div className="flex flex-wrap gap-2">
      {customDates ? <span className="self-center text-xs text-muted-foreground">Selected dates · visitor history up to 90 days</span> : <Select value={days} onValueChange={value => { setDays(value); setInspection(null); }}><SelectTrigger aria-label="Activity period" className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="today">Today (IST)</SelectItem>{[7, 30, 90].map(day => <SelectItem key={day} value={String(day)}>Last {day} days</SelectItem>)}</SelectContent></Select>}
      <Select value={device} onValueChange={setDevice}><SelectTrigger aria-label="Device filter" className="w-32"><SelectValue /></SelectTrigger><SelectContent>{["all", "mobile", "tablet", "desktop"].map(value => <SelectItem key={value} value={value}>{value === "all" ? "All devices" : value}</SelectItem>)}</SelectContent></Select>
      <Select value={source} onValueChange={setSource}><SelectTrigger aria-label="Traffic filter" className="w-40"><SelectValue /></SelectTrigger><SelectContent>{["all", "direct", "paid_search", "organic_search", "social", "referral", "email", "other_campaign"].map(value => <SelectItem key={value} value={value}>{value === "all" ? "All traffic" : value.replace(/_/g, " ")}</SelectItem>)}</SelectContent></Select>
      <Button variant="outline" size="icon" disabled={busy} aria-label="Refresh visitor activity" onClick={() => void refresh()}><RefreshCw className={busy ? "animate-spin" : ""} /></Button>
    </div></div>
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    <dl className="my-5 grid grid-cols-2 gap-4 sm:grid-cols-4">{[["Visits", filtered.length], ["Designs viewed", sum("viewed")], ["Details opened", sum("opened")], ["Designs selected", sum("selected")]].map(([label, count]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-2xl font-semibold">{count}</dd></div>)}</dl>
    {!busy && !error && !filtered.length && <p className="text-sm text-muted-foreground">No tracked visits match this period and filters.</p>}
    <FullVisitorFunnel rows={filtered} onInspect={(label, matching) => setInspection({ label, ids: matching.map(row => row.id) })} />
    <h3 className="mt-5 text-sm font-semibold">Scroll reach</h3><div className="mt-2 overflow-x-auto"><table className="w-full text-left text-xs"><thead className="text-muted-foreground"><tr><th className="py-2">Page</th>{[25,50,75,100].map(depth => <th key={depth} className="px-3">{depth}%</th>)}</tr></thead><tbody>{["/", "/sourcing", "/designs", "/designs/flexible-pouches"].map(path => <tr key={path} className="border-t border-border"><td className="py-2">{path}</td>{[25,50,75,100].map(depth => <td key={depth} className="px-3">{filtered.filter(row => (row.scroll_depth[path] ?? 0) >= depth).length}</td>)}</tr>)}</tbody></table></div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold">{inspection ? inspection.label : "Individual session journeys"} ({sessionRows.length})</h3>{inspection && <Button variant="outline" size="sm" onClick={() => setInspection(null)}>All sessions</Button>}</div>
    <div className="mt-3 max-h-72 overflow-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="text-muted-foreground"><tr><th className="py-2">Session / started (IST)</th><th>Device / source</th><th>Last observed action</th><th>Filled fields</th><th>Viewed / opened / selected</th></tr></thead><tbody>{sessionRows.map(row => <tr key={row.id} className="border-t border-border"><td className="py-2"><Button variant="link" size="sm" className="h-auto px-0" onClick={() => setChosen(row.id)}>Session {row.id.slice(0, 8)}</Button><span className="block">{new Date(row.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span></td><td>{row.device} / {row.source.replace(/_/g, " ")}</td><td>{row.journey?.at(-1) ? journeyLabel(row.journey[row.journey.length - 1]) : Object.entries(row.steps).sort((a,b) => Number(b[1]) - Number(a[1]))[0]?.[0].replace(/_/g, " ") ?? "Design browsing"}</td><td>{row.journey?.length ? journeyFields(row.journey).length : "Not recorded"}</td><td>{row.viewed} / {row.opened} / {row.selected}</td></tr>)}</tbody></table></div>
    {rows.find(row => row.id === chosen) && <SessionJourney row={rows.find(row => row.id === chosen) as VisitorReportRow} />}
    {chosen && !rows.some(row => row.id === chosen) && <p className="mt-3 text-sm text-muted-foreground">This chat’s session is not in the selected period. Choose a longer period.</p>}
    <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Measurement starts with this update; past visits cannot be recovered. Visits reset after 30 minutes of inactivity. “Not yet continued” includes active visitors, not confirmed exits. Optional questions and designs may be bypassed. Design views count unique cards at least half visible for one second, not automatically loaded cards. Scroll reach uses each page’s scrollable height and may vary as designs load. Messages, photos and phone numbers are excluded.</p>
  </section>;
}