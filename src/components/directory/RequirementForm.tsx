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
    <div className="rounded-2xl border border-border bg-muted/40 p-4 md:p-5">
      <label htmlFor="req" className="flex items-center gap-2 text-sm font-semibold">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">1</span>
        Describe what you need
      </label>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {STARTERS.map((s) => (
          <button key={s} type="button" onClick={() => add(s)} className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground">+ {s}</button>
        ))}
      </div>
      <textarea
        id="req"
        className={`${field} mt-2 min-h-[88px]`}
        placeholder="e.g. 10,000 printed kraft paper bags, 12x10x4 in, delivered in Delhi"
        value={text}
        onChange={(e) => onText(e.target.value)}
        maxLength={4000}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {DETAILS.map((d) => (
          <button key={d} type="button" onClick={() => add(d)} className="rounded-full bg-background px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground">+ {d.replace(": ", "")}</button>
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
      <p className="mt-3 text-xs text-muted-foreground">
        Not sure who to pick? <a href={GROUP_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline">Post it in our WhatsApp group</a> and makers will reach out.
      </p>
    </div>
  );
}
