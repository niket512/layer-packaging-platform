import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, ArrowLeft, Users, MousePointer2, Image, ListChecks } from "lucide-react";
import { type VisitorReportRow, journeyFields } from "@/lib/visitor-metrics";
import { inIndiaToday } from "@/lib/visitor-funnel";
import { lastSessionAction, adminPageLabel } from "@/lib/admin-journey-labels";
import { FullVisitorFunnel } from "./FullVisitorFunnel";
import { SessionJourney } from "./SessionJourney";
import { inAdminDateRange, type AdminDateRange } from "@/lib/admin-date-range";
import { ADMIN_SOURCES, matchesAdminSource } from "@/lib/admin-source-filter";

export function VisitorAnalytics({ sessionId, dateRange = { from: "", to: "" }, sourceFilter, onSourceChange }: { sessionId?: string | null; dateRange?: AdminDateRange; sourceFilter?: string; onSourceChange?: (source: string) => void }) {
  const customDates = Boolean(dateRange.from || dateRange.to);
  const [chosen, setChosen] = useState<string | null>(null);
  const [view, setView] = useState("funnel");
  const [inspection, setInspection] = useState<{ label: string; ids: string[] } | null>(null);
  const [rows, setRows] = useState<VisitorReportRow[]>([]);
  const [days, setDays] = useState("7");
  const [device, setDevice] = useState("all");
  const [localSource, setLocalSource] = useState("all");
  const source = sourceFilter ?? localSource;
  const setSource = onSourceChange ?? setLocalSource;
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
  useEffect(() => { setInspection(null); setChosen(null); }, [dateRange.from, dateRange.to, source, device]);
  useEffect(() => { if (sessionId) { setChosen(sessionId); setView("sessions"); } }, [sessionId]);
  const filtered = rows.filter(row => (customDates ? inAdminDateRange(row.created_at, dateRange) : days !== "today" || inIndiaToday(row)) && (device === "all" || row.device === device) && matchesAdminSource(row.source, source));
  const sessionRows = inspection ? filtered.filter(row => inspection.ids.includes(row.id)) : filtered;
  const chosenRow = filtered.find(row => row.id === chosen);
  const sum = (key: "viewed" | "opened" | "selected") => filtered.reduce((total, row) => total + row[key], 0);
  const inspect = (label: string, matching: VisitorReportRow[]) => { setInspection({ label, ids: matching.map(row => row.id) }); setChosen(null); setView("sessions"); };
  const metrics = [
    { label: "Tracked visits", count: filtered.length, icon: Users },
    { label: "Enquiries saved", count: filtered.filter(row => row.steps.request_saved !== undefined).length, icon: ListChecks },
    { label: "Design cards viewed", count: sum("viewed"), icon: Image },
    { label: "Designs used", count: sum("selected"), icon: MousePointer2 },
  ];
  return <section aria-label="Visitor activity" className="mb-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Visitor activity</h2><div className="flex flex-wrap gap-2">
      {customDates ? <span className="self-center text-xs text-muted-foreground">Selected dates · up to 90 days of history</span> : <Select value={days} onValueChange={value => { setDays(value); setInspection(null); setChosen(null); }}><SelectTrigger aria-label="Activity period" className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="today">Today (IST)</SelectItem>{[7, 30, 90].map(day => <SelectItem key={day} value={String(day)}>Last {day} days</SelectItem>)}</SelectContent></Select>}
      <Select value={device} onValueChange={setDevice}><SelectTrigger aria-label="Device filter" className="w-36"><SelectValue /></SelectTrigger><SelectContent>{["all", "mobile", "tablet", "desktop"].map(value => <SelectItem key={value} value={value}>{value === "all" ? "All devices" : value.charAt(0).toUpperCase() + value.slice(1)}</SelectItem>)}</SelectContent></Select>
      {sourceFilter === undefined && <Select value={source} onValueChange={setSource}><SelectTrigger aria-label="Traffic filter" className="w-52"><SelectValue /></SelectTrigger><SelectContent>{ADMIN_SOURCES.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>}
      <Button variant="outline" size="icon" disabled={busy} aria-label="Refresh visitor activity" title="Refresh visitor activity" onClick={() => void refresh()}><RefreshCw className={busy ? "animate-spin" : ""} /></Button>
    </div></div>
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    <dl className="my-5 grid grid-cols-2 gap-3 lg:grid-cols-4">{metrics.map(({ label, count, icon: Icon }) => <div key={label} className="rounded-lg border border-border bg-background p-4"><dt className="flex items-center justify-between gap-2 text-xs text-muted-foreground">{label}<Icon className="h-4 w-4 shrink-0" /></dt><dd className="mt-2 text-3xl font-semibold tabular-nums">{count}</dd></div>)}</dl>
    {busy && !rows.length && <p role="status" className="py-3 text-sm text-muted-foreground">Loading visitor activity…</p>}
    {!busy && !error && !filtered.length && <p className="py-3 text-sm text-muted-foreground">No tracked visits match this period and filters.</p>}
    <Tabs value={view} onValueChange={setView}>
      <TabsList aria-label="Visitor report views" className="max-w-full"><TabsTrigger value="funnel">Funnel</TabsTrigger><TabsTrigger value="sessions">Sessions · {sessionRows.length}</TabsTrigger><TabsTrigger value="scroll">Scroll reach</TabsTrigger></TabsList>
      <TabsContent value="funnel"><FullVisitorFunnel rows={filtered} onInspect={inspect} /></TabsContent>
      <TabsContent value="sessions">
        <div className="my-4 flex flex-wrap items-center justify-between gap-3"><h3 className="text-base font-semibold">{chosenRow ? `Visit ${chosenRow.id.slice(0, 8)}` : inspection ? inspection.label : "Session journeys"}</h3>{chosenRow ? <Button variant="outline" size="sm" onClick={() => setChosen(null)}><ArrowLeft className="h-4 w-4" />Back to sessions</Button> : inspection && <Button variant="outline" size="sm" onClick={() => setInspection(null)}>All sessions</Button>}</div>
        {chosenRow ? <SessionJourney row={chosenRow} /> : <div className="max-h-[640px] overflow-auto rounded-lg border border-border bg-background"><table className="w-full min-w-[720px] text-left text-sm"><thead className="sticky top-0 bg-muted text-xs text-muted-foreground"><tr><th className="px-4 py-3">Visit / started (IST)</th><th className="px-3">Device / traffic source</th><th className="px-3">Last recorded action</th><th className="px-3">Fields filled</th><th className="px-3">Designs viewed / opened / used</th></tr></thead><tbody>{sessionRows.map(row => <tr key={row.id} className="border-t border-border hover:bg-muted/50"><td className="px-4 py-3"><Button variant="link" size="sm" className="h-auto px-0" onClick={() => setChosen(row.id)}>Visit {row.id.slice(0, 8)}</Button><span className="mt-1 block whitespace-nowrap text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span></td><td className="px-3 text-xs"><span className="block capitalize">{row.device}</span><span className="mt-1 block text-muted-foreground">{ADMIN_SOURCES.find(([value]) => value === row.source)?.[1] ?? row.source.replace(/_/g, " ")}</span></td><td className="max-w-60 px-3 text-xs">{lastSessionAction(row)}</td><td className="px-3 tabular-nums">{row.journey?.length ? journeyFields(row.journey).length : "Not recorded"}</td><td className="px-3 tabular-nums">{row.viewed} / {row.opened} / {row.selected}</td></tr>)}</tbody></table>{!sessionRows.length && <p className="p-6 text-sm text-muted-foreground">No sessions match this selection.</p>}</div>}
        {chosen && !chosenRow && <p className="mt-3 text-sm text-muted-foreground">This visit is outside the selected period or filters. Select a longer period or all devices.</p>}
      </TabsContent>
      <TabsContent value="scroll"><h3 className="my-4 text-base font-semibold">Page scroll reach</h3><div className="overflow-x-auto"><table className="w-full min-w-[420px] text-left text-sm"><thead className="text-xs text-muted-foreground"><tr><th className="py-3">Page</th>{[25,50,75,100].map(depth => <th key={depth} className="px-3">{depth}%</th>)}</tr></thead><tbody>{["/", "/sourcing", "/designs", "/designs/flexible-pouches"].map(path => <tr key={path} className="border-t border-border"><td className="py-3">{adminPageLabel(path)}</td>{[25,50,75,100].map(depth => <td key={depth} className="px-3 tabular-nums">{filtered.filter(row => (row.scroll_depth[path] ?? 0) >= depth).length}</td>)}</tr>)}</tbody></table></div></TabsContent>
    </Tabs>
    <details className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground"><summary className="cursor-pointer font-medium">Measurement notes</summary><p className="mt-2 leading-relaxed">Visits reset after 30 minutes of inactivity. Last recorded actions and no further progress are not confirmed exits. Only saved enquiries count as conversions. Form step names reflect the current form; untagged timeline events show step numbers only. Design views count unique cards at least half visible for one second. Field values, messages, photos and phone numbers are excluded from visitor reports. Scroll reach may vary as designs load. Historical visits without tracking cannot be recovered.</p></details>
  </section>;
}
