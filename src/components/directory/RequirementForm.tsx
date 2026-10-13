import { Button } from "@/components/ui/button";
import { MessageCircle, Plus } from "lucide-react";

const GROUP_URL = "https://chat.whatsapp.com/I0vypMLz6bEKIeViw8rwh6";

const field = "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

const STARTERS = [
  "Printed kraft paper bags",
  "Corrugated shipping boxes",
  "Stand-up pouches with zip",
  "HDPE bottles 500 ml",
  "Courier / mailer bags",
];
const DETAILS = ["Quantity: ", "Size: ", "Delivery city: "];

interface Props {
  contact: string;
  onContact: (v: string) => void;
  text: string;
  onText: (v: string) => void;
}

export function RequirementForm({ contact, onContact, text, onText }: Props) {
  const add = (s: string) => onText(text.trim() ? `${text.trim()}\n${s}` : s);
  return (
    <div>
      <label htmlFor="req" className="text-sm font-semibold">
        What packaging do you need?
      </label>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {STARTERS.map((s) => (
           <Button key={s} variant="outline" size="sm" onClick={() => add(s)} className="h-7 rounded-full px-2.5 text-xs text-muted-foreground hover:border-primary"><Plus className="h-3 w-3" />{s}</Button>
        ))}
      </div>
      <textarea
        id="req"
        className={`${field} mt-3 min-h-[108px] resize-y bg-card p-4 text-base transition-colors focus:border-primary`}
        placeholder="e.g. 10,000 printed kraft paper bags, 12x10x4 in, delivered in Delhi"
        value={text}
        onChange={(e) => onText(e.target.value)}
        maxLength={4000}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {DETAILS.map((d) => (
          <Button key={d} variant="ghost" size="sm" onClick={() => add(d)} className="h-7 px-2 text-xs text-muted-foreground"><Plus className="h-3 w-3" />{d.replace(": ", "")}</Button>
        ))}
        <input
          className={`${field} h-9 sm:ml-auto sm:max-w-[220px]`}
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
