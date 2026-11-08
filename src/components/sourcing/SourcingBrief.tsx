import { useState } from "react";
import { Check, Pencil, TriangleAlert, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRIEF_LABELS, sortSourcingBrief, unclearBriefNotes } from "@/lib/sourcing";
import type { SourcingBriefField } from "../../../supabase/functions/_shared/sourcing-intake";

export function SourcingBrief({ fields, submitted, disabled, onSave }: { fields: SourcingBriefField[]; submitted?: boolean; disabled?: boolean; onSave?: (fields: SourcingBriefField[]) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<SourcingBriefField[]>([]);
  if (!fields.length) return null;
  const ordered = sortSourcingBrief(fields);
  const notes = unclearBriefNotes(ordered);
  const canEdit = !!onSave && !disabled && !editing;
  return <section aria-label="Your packaging brief" className={submitted ? "mt-6 border-t border-border pt-4" : "my-6 border-y border-border py-4"}>
    <div className="mb-1.5 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold"><FileText className="h-3.5 w-3.5 text-primary" />Your packaging brief</h2>
      {canEdit && <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary hover:text-primary" onClick={() => { setDraft(ordered); setEditing(true); }}><Pencil className="h-3 w-3" />Edit brief</Button>}
    </div>
    {editing ? <div className="space-y-2">{draft.map((field, i) => <div key={field.topic} className="flex flex-row items-center gap-3">
      <label htmlFor={`brief-${field.topic}`} className="w-28 shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:w-36">{BRIEF_LABELS[field.topic]}</label>
      <Input id={`brief-${field.topic}`} className="h-8 flex-1 text-[13px]" value={field.value} maxLength={240} onChange={e => setDraft(prev => prev.map((f, j) => i === j ? { ...f, value: e.target.value, source: "buyer" } : f))} />
    </div>)}</div> : <dl className="divide-y divide-border/50">{ordered.map(field => <div key={field.topic} className="flex flex-row items-baseline gap-3 py-1 first:pt-0 last:pb-0">
      <dt className="w-28 shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:w-36">{BRIEF_LABELS[field.topic]}</dt>
      <dd className="min-w-0 flex-1">
        <span className="break-words text-[13px] font-medium leading-snug">{field.value}{field.source === "image" && <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">From design</span>}</span>
        {notes[field.topic] && <span className="ml-2 inline-flex translate-y-px items-center gap-1 rounded bg-[hsl(var(--sourcing-warning-soft))] px-1.5 py-0.5 text-[11px] font-medium text-[hsl(var(--sourcing-warning))]"><TriangleAlert className="h-2.5 w-2.5 shrink-0" aria-hidden />{notes[field.topic]}</span>}
      </dd>
    </div>)}</dl>}
    {editing && <div className="mt-3 flex justify-end gap-2"><Button variant="ghost" size="sm" className="h-8" onClick={() => setEditing(false)}><X />Cancel</Button><Button size="sm" className="h-8" onClick={() => { onSave?.(draft); setEditing(false); }}><Check />Save details</Button></div>}
  </section>;
}
