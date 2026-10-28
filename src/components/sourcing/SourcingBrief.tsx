import { useState } from "react";
import { Check, Pencil, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRIEF_LABELS } from "@/lib/sourcing";
import type { SourcingBriefField } from "../../../supabase/functions/_shared/sourcing-intake";

export function SourcingBrief({ fields, submitted, disabled, onSave }: { fields: SourcingBriefField[]; submitted?: boolean; disabled?: boolean; onSave: (fields: SourcingBriefField[]) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<SourcingBriefField[]>([]);
  if (!fields.length) return null;
  return <section aria-label="Your packaging brief" className="my-6 border-y border-border py-5">
    <div className="mb-4 flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-base font-semibold"><FileText className="h-4 w-4 text-primary" />Your packaging brief</h2>{!submitted && !editing && <Button variant="ghost" size="sm" disabled={disabled} onClick={() => { setDraft(fields); setEditing(true); }}><Pencil className="h-3.5 w-3.5" />Edit details</Button>}</div>
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">{(editing ? draft : fields).map((field, i) => <div key={field.topic} className="min-w-0"><dt className="mb-1 text-xs text-muted-foreground"><label htmlFor={editing ? `brief-${field.topic}` : undefined}>{BRIEF_LABELS[field.topic]}</label></dt><dd className="break-words text-sm font-medium">{editing ? <Input id={`brief-${field.topic}`} value={field.value} maxLength={240} onChange={e => setDraft(prev => prev.map((f, j) => i === j ? { ...f, value: e.target.value, source: "buyer" } : f))} /> : <>{field.value}{field.source === "image" && <span className="ml-2 text-xs font-normal text-muted-foreground">From design</span>}</>}</dd></div>)}</dl>
    {editing && <div className="mt-4 flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => setEditing(false)}><X />Cancel</Button><Button size="sm" onClick={() => { onSave(draft); setEditing(false); }}><Check />Save details</Button></div>}
  </section>;
}