import { Button } from "@/components/ui/button";
import { visitorFunnels, type FunnelStage } from "@/lib/visitor-funnel";
import { journeyFields, type VisitorReportRow } from "@/lib/visitor-metrics";

function FunnelTable({ title, stages, onInspect }: { title: string; stages: FunnelStage[]; onInspect: (label: string, rows: VisitorReportRow[]) => void }) {
  const base = stages[0]?.rows.length ?? 0;
  return <section className="min-w-0" aria-label={title}>
    <h3 className="mb-3 text-base font-semibold">{title}</h3>
    <div className="overflow-x-auto"><table className="w-full min-w-[470px] text-left text-sm">
      <thead className="border-b border-border text-xs text-muted-foreground"><tr><th className="py-2">Stage</th><th className="px-3">Visits</th><th className="px-3">% of entry</th><th className="px-3">No further progress</th></tr></thead>
      <tbody>{stages.map((stage, index) => <tr key={stage.id} className="border-b border-border/60">
        <td className="py-3"><span className="flex items-start gap-2 font-medium"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-accent text-xs text-primary">{index + 1}</span><span>{stage.label}</span></span><div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${stage.rows.length / Math.max(base, stage.rows.length, 1) * 100}%` }} /></div></td>
        <td className="px-3"><Button variant="link" size="sm" className="h-auto px-0 tabular-nums" disabled={!stage.rows.length} onClick={() => onInspect(stage.label, stage.rows)}>{stage.rows.length}</Button></td>
        <td className="px-3 tabular-nums">{base ? `${Math.round(stage.rows.length / base * 100)}%` : "—"}</td>
        <td className="px-3">{index === stages.length - 1 ? "—" : <Button variant="link" size="sm" className="h-auto px-0 tabular-nums" disabled={!stage.remaining.length} onClick={() => onInspect(`No further progress · ${stage.label}`, stage.remaining)}>{stage.remaining.length}{stage.rows.length > 0 ? ` (${Math.round(stage.remaining.length / stage.rows.length * 100)}%)` : ""}</Button>}</td>
      </tr>)}</tbody>
    </table></div>
  </section>;
}

export function FullVisitorFunnel({ rows, onInspect }: { rows: VisitorReportRow[]; onInspect: (label: string, rows: VisitorReportRow[]) => void }) {
  const funnel = visitorFunnels(rows);
  const browse = [
    ["Viewed catalogue cards", rows.filter(row => row.viewed > 0)],
    ["Opened design details", rows.filter(row => row.opened > 0)],
    ["Clicked Use design", rows.filter(row => row.selected > 0)],
    ["Used design → started request", rows.filter(row => row.selected > 0 && funnel.overall[2]?.rows.includes(row))],
    ["Used design → saved enquiry", rows.filter(row => row.selected > 0 && row.steps.request_saved !== undefined)],
  ] as [string, VisitorReportRow[]][];
  const detailed = rows.filter(row => row.journey?.length);
  const completed = detailed.filter(row => journeyFields(row.journey ?? []).length > 0);
  const errors = ["format_required", "phone_invalid", "details_invalid", "save_failed"] as const;
  return <div className="my-6 space-y-7">
    <FunnelTable title="Visit → saved enquiry" stages={funnel.overall} onInspect={onInspect} />
    <p className="text-xs leading-relaxed text-muted-foreground">Counts are visits, not people. “Started a request” includes later observed request progress when early interaction was not recorded. “No further progress” includes active visits and is not a confirmed exit. Optional steps may be bypassed; they are not counted as viewed. Only saved enquiries are conversions.</p>
    <div className="grid gap-7 xl:grid-cols-2">
      <FunnelTable title={`Box enquiry form · ${funnel.formCount} visits`} stages={funnel.form} onInspect={onInspect} />
      <FunnelTable title={`Sourcing chat · ${funnel.chatCount} visits`} stages={funnel.chat} onInspect={onInspect} />
    </div>
    <p className="text-xs text-muted-foreground">Form steps are available only for visits with recorded form journeys. Chat includes observed chat-page visits and first messages. A visit using both paths appears in both; saved outcomes are session-wide, not attributed to one path.</p>
    <details className="border-t border-border pt-4"><summary className="cursor-pointer text-sm font-semibold">Catalogue engagement & validation issues</summary><div className="mt-4 grid gap-7 lg:grid-cols-2">
      <section aria-label="Design browsing funnel"><h3 className="mb-3 text-base font-semibold">Design browsing & enquiry outcomes</h3><dl className="divide-y divide-border">{browse.map(([label, matching]) => <div key={label} className="flex items-center justify-between gap-3 py-2"><dt className="text-sm">{label}</dt><dd><Button variant="link" size="sm" disabled={!matching.length} onClick={() => onInspect(label, matching)}>{matching.length} visits</Button></dd></div>)}</dl><p className="mt-3 text-xs text-muted-foreground">Design browsing is optional, not a required step before requesting. Details and Use design can be clicked independently.</p></section>
      <section aria-label="Form completion and blockers"><h3 className="mb-3 text-base font-semibold">Field completion & validation issues</h3><dl className="divide-y divide-border"><div className="flex items-center justify-between gap-3 py-2"><dt className="text-sm">Visits with filled fields</dt><dd><Button variant="link" size="sm" disabled={!completed.length} onClick={() => onInspect("Visits with filled fields", completed)}>{completed.length}</Button></dd></div>{errors.map(reason => { const matching = detailed.filter(row => row.journey?.some(e => e.kind === "form_error" && e.reason === reason)); return <div key={reason} className="flex items-center justify-between gap-3 py-2"><dt className="text-sm">{reason === "format_required" ? "Box type missing" : reason === "phone_invalid" ? "Invalid contact number" : reason === "details_invalid" ? "Project details incomplete" : "Save attempt failed"}</dt><dd><Button variant="link" size="sm" disabled={!matching.length} onClick={() => onInspect(reason === "format_required" ? "Box type missing" : reason === "phone_invalid" ? "Invalid contact number" : reason === "details_invalid" ? "Project details incomplete" : "Save attempt failed", matching)}>{matching.length} visits</Button></dd></div>; })}</dl><p className="mt-3 text-xs text-muted-foreground">Blockers may have been resolved later. Field counts reflect the latest recorded filled state, not field values. {detailed.length} of {rows.length} visits have detailed journeys.</p></section>
    </div></details>
  </div>;
}