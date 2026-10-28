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
  return <section aria-label="Your packaging brief" className={submitted ? "mt-8 border-t border-border pt-6" : "my-6 border-y border-border py-5"}>
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-base font-semibold"><FileText className="h-4 w-4 text-primary" />Your packaging brief</h2>
      {canEdit && <Button variant="ghost" size="sm" className="text-primary hover:text-primary" onClick={() => { setDraft(ordered); setEditing(true); }}><Pencil className="h-3.5 w-3.5" />Edit brief</Button>}
    </div>
    {editing ? <div className="space-y-3">{draft.map((field, i) => <div key={field.topic} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-6">
      <label htmlFor={`brief-${field.topic}`} className="w-44 shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">{BRIEF_LABELS[field.topic]}</label>
      <Input id={`brief-${field.topic}`} className="flex-1" value={field.value} maxLength={240} onChange={e => setDraft(prev => prev.map((f, j) => i === j ? { ...f, value: e.target.value, source: "buyer" } : f))} />
    </div>)}</div> : <dl className="divide-y divide-border/60">{ordered.map(field => <div key={field.topic} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:gap-6">
      <dt className="w-44 shrink-0 pt-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{BRIEF_LABELS[field.topic]}</dt>
      <dd className="min-w-0 flex-1">
        <span className="break-words text-sm font-medium">{field.value}{field.source === "image" && <span className="ml-2 text-xs font-normal text-muted-foreground">From design</span>}</span>
        {notes[field.topic] && <p className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-[hsl(var(--sourcing-warning-soft))] px-2 py-1 text-xs font-medium text-[hsl(var(--sourcing-warning))]"><TriangleAlert className="h-3 w-3 shrink-0" aria-hidden />{notes[field.topic]}</p>}
      </dd>
    </div>)}</dl>}
    {editing && <div className="mt-4 flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => setEditing(false)}><X />Cancel</Button><Button size="sm" onClick={() => { onSave?.(draft); setEditing(false); }}><Check />Save details</Button></div>}
  </section>;
}
