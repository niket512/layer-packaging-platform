import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus, Check } from "lucide-react";

const GROUP_URL = "https://chat.whatsapp.com/I0vypMLz6bEKIeViw8rwh6";

const field = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

const STARTERS = [
  "Printed kraft paper bags",
  "Corrugated shipping boxes",
  "Stand-up pouches with zip",
  "HDPE bottles 500 ml",
  "Courier / mailer bags",
];
const DETAILS = [
  { key: "Quantity", ph: "e.g. 10,000" },
  { key: "Size", ph: "e.g. 12x10x4 in" },
  { key: "Delivery city", ph: "e.g. Delhi" },
];

interface Props {
  contact: string;
  onContact: (v: string) => void;
  text: string;
  onText: (v: string) => void;
}

export function RequirementForm({ contact, onContact, text, onText }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const [val, setVal] = useState("");
  const add = (s: string) => onText(text.trim() ? `${text.trim()}\n${s}` : s);
  const commit = () => {
    if (open && val.trim()) add(`${open}: ${val.trim()}`);
    setOpen(null);
    setVal("");
  };
  return (
    <div>
      <label htmlFor="req" className="text-sm font-semibold">What packaging do you need?</label>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {STARTERS.map((s) => (
          <button key={s} type="button" onClick={() => add(s)} className="inline-flex h-7 items-center gap-1 rounded-md bg-muted px-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
            <Plus className="h-3 w-3" />{s}
          </button>
        ))}
      </div>
      <textarea
        id="req"
        className={`${field} mt-3 min-h-[72px] resize-y bg-card p-3 text-base transition-colors focus:border-primary`}
        rows={2}
        placeholder="e.g. 10,000 printed kraft paper bags, 12x10x4 in, delivered in Delhi"
        value={text}
        onChange={(e) => onText(e.target.value)}
        maxLength={4000}
      />
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {open ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{open}</span>
            <input
              autoFocus
              className={`${field} h-8 !w-40`}
              placeholder={DETAILS.find((d) => d.key === open)?.ph}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setOpen(null); setVal(""); } }}
              aria-label={open}
            />
            <Button size="sm" variant="ghost" onClick={commit} className="h-8 px-2" aria-label={`Add ${open}`}><Check className="h-4 w-4" /></Button>
          </div>
        ) : (
          DETAILS.map((d) => (
            <Button key={d.key} variant="ghost" size="sm" onClick={() => setOpen(d.key)} className="h-7 px-2 text-xs text-muted-foreground"><Plus className="h-3 w-3" />{d.key}</Button>
          ))
        )}
        <input
          className="ml-auto h-8 w-full border-0 border-b border-border bg-transparent px-1 text-xs text-muted-foreground outline-none focus:border-primary sm:w-[200px]"
          placeholder="Your name or brand (optional)"
          value={contact}
          onChange={(e) => onContact(e.target.value)}
          maxLength={200}
          aria-label="Your name or brand"
        />
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        Need more options? <a href={GROUP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"><MessageCircle className="h-3 w-3" />Ask our WhatsApp community</a>
      </p>
    </div>
  );
}
