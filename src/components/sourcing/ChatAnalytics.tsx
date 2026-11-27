import { summariseChats, type AnalysedChat } from "@/lib/chatAnalytics";
import { BRIEF_LABELS } from "@/lib/sourcing";

function Bars({ rows }: { rows: [string, number][] }) {
  const max = Math.max(1, ...rows.map(r => r[1]));
  return <ul className="space-y-1.5">{rows.length ? rows.map(([k, v]) => <li key={k} className="text-xs"><div className="flex justify-between gap-2"><span className="truncate">{k}</span><span className="text-muted-foreground">{v}</span></div><div className="mt-0.5 h-1.5 rounded bg-muted"><div className="h-1.5 rounded bg-primary" style={{ width: `${(v / max) * 100}%` }} /></div></li>) : <li className="text-xs text-muted-foreground">No data yet</li>}</ul>;
}

export function ChatAnalytics({ chats }: { chats: AnalysedChat[] }) {
  const s = summariseChats(chats);
  const maxDay = Math.max(1, ...s.perDay.map(d => d[1]));
  const maxHour = Math.max(1, ...s.perHour);
  const cards: [string, string][] = [["Conversation records", `${s.total}`], ["Enquiries saved", `${s.submitted} · ${s.conversion}%`], ["WhatsApp captured", `${s.withContact}`], ["Shared photos", `${s.withPhotos}`], ["Catalogues viewed", `${s.cataloguesViewed}`], ["Used a design", `${s.designsUsed}`], ["Avg messages", `${s.avgMessages}`], ["Avg time (min)", `${s.avgMinutes}`], ["Avg details captured", `${s.avgBrief}`]];
  return <section aria-label="Chat analysis" className="mb-6 space-y-4">
    <h2 className="text-lg font-semibold">Conversation insights</h2>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{cards.map(([l, v]) => <div key={l} className="rounded-lg border border-border bg-background p-3"><p className="text-xs text-muted-foreground">{l}</p><p className="mt-1 text-xl font-semibold">{v}</p></div>)}</div>
    {s.catalogueLinked < s.total && <p className="text-xs text-muted-foreground">Catalogue view and design-use counts are available for {s.catalogueLinked} of {s.total} chats; older chats saved before this tracking are not linked.</p>}
    <div className="grid gap-3 md:grid-cols-3">
      <div className="min-w-0 border-t border-border py-4"><h3 className="mb-3 text-sm font-semibold">Last recorded chat stage</h3><Bars rows={s.stages} /></div>
      <div className="min-w-0 border-t border-border py-4"><h3 className="mb-3 text-sm font-semibold">Packaging asked for</h3><Bars rows={s.formats} /></div>
      <div className="min-w-0 border-t border-border py-4"><h3 className="mb-3 text-sm font-semibold">Details most often captured</h3><Bars rows={s.topics.map(([k, v]) => [BRIEF_LABELS[k] ?? k, v])} /></div>
    </div>
    <div className="grid gap-3 md:grid-cols-2">
      <div className="min-w-0 border-t border-border py-4"><h3 className="mb-3 text-sm font-semibold">New chats · last 14 days</h3><div className="flex h-24 items-end gap-1">{s.perDay.map(([d, v]) => <div key={d} title={`${d}: ${v}`} className="flex-1 rounded-t bg-primary/80" style={{ height: `${Math.max(4, (v / maxDay) * 100)}%` }} />)}</div></div>
      <div className="min-w-0 border-t border-border py-4"><h3 className="mb-3 text-sm font-semibold">Time of day started</h3><div className="flex h-24 items-end gap-0.5">{s.perHour.map((v, h) => <div key={h} title={`${h}:00 — ${v}`} className="flex-1 rounded-t bg-primary/80" style={{ height: `${Math.max(4, (v / maxHour) * 100)}%` }} />)}</div><div className="mt-1 flex justify-between text-[10px] text-muted-foreground"><span>0h</span><span>12h</span><span>23h</span></div></div>
    </div>
  </section>;
}
