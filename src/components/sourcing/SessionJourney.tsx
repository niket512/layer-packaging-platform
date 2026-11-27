import { BOX_DESIGNS, CATEGORIES } from "./packaging-catalogue";
import { POUCH_DESIGNS } from "./pouch-designs";
import { SHEET_DESIGNS } from "./sheet-catalogue";
import { journeyFields, type JourneyEvent, type VisitorReportRow } from "@/lib/visitor-metrics";
import { ADMIN_FIELD_LABELS as fields, adminJourneyLabel, adminPageLabel } from "@/lib/admin-journey-labels";

const designs = [...SHEET_DESIGNS, ...BOX_DESIGNS, ...POUCH_DESIGNS];
const time = (value: number | string) => new Date(value).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" });
export function journeyLabel(event: JourneyEvent) {
  const label = adminJourneyLabel(event);
  return event.design ? `${label}: ${designs.find(d => d.id === event.design)?.name ?? event.design}` : label;
}
export function SessionJourney({ row }: { row: VisitorReportRow }) {
  const events = row.journey ?? [];
  const last = events.at(-1);
  const filled = journeyFields(events);
  const saved = row.steps.request_saved !== undefined;
  const active = Date.now() - new Date(row.updated_at).getTime() < 30 * 60 * 1000;
  return <section aria-label="Session journey" className="mt-4 border-t border-border pt-4">
    <h3 className="text-lg font-semibold">Session {row.id.slice(0, 8)}</h3>
    <p className="mt-1 text-xs text-muted-foreground">{time(row.created_at)} IST · {row.device} · {row.source.replace(/_/g, " ")}</p>
    <dl className="my-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Catalogue cards viewed", row.viewed], ["Detail clicks", events.filter(e => e.kind === "opened").length], ["Use design clicks", events.filter(e => e.kind === "selected").length], ["Fields currently filled", filled.length]].map(([label, count]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="text-xl font-semibold">{count}</dd></div>)}</dl>
    <p className="text-sm font-medium">{saved ? "Request saved" : active ? "Recent activity — may still be browsing" : "Inactive — no saved request"}</p>
    {last && <p className="mt-1 text-sm">Last observed: {journeyLabel(last)}</p>}
    {filled.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Filled fields: {filled.map(f => fields[f]).join(" · ")}</p>}
    {!events.length ? <p className="mt-3 text-sm text-muted-foreground">No detailed actions were recorded for this visit.</p> : <ol className="mt-4 max-h-[520px] space-y-0 overflow-y-auto">{events.map((event, index) => {
      const design = designs.find(d => d.id === event.design);
      const category = event.family ? CATEGORIES[event.family].find(c => c.id === event.category)?.label : undefined;
      return <li key={index} className="flex gap-3 border-b border-border py-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />{design && <img src={design.image} alt={design.name} loading="lazy" className="h-12 w-12 shrink-0 rounded object-contain" />}<div className="min-w-0"><p className="break-words text-sm font-medium">{journeyLabel(event)}</p><p className="mt-1 text-xs text-muted-foreground">{time(event.at)} IST · {adminPageLabel(event.path)}{event.position ? ` · Position #${event.position}` : ""}{category ? ` · ${category}` : ""}{event.kind === "field" ? ` · Step ${event.step}` : ""}</p></div></li>;
    })}</ol>}
    <p className="mt-3 text-xs text-muted-foreground">Positions refer to the displayed, filtered catalogue. Field values are not recorded. The last observed action is not proof of an exact exit. {events.length >= 1000 ? "This visit reached the 1,000-action recording limit." : ""}</p>
  </section>;
}