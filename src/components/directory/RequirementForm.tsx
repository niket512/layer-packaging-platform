import { GROUP_URL } from "./group-url";

const field = "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

interface Props {
  contact: string;
  onContact: (v: string) => void;
  text: string;
  onText: (v: string) => void;
}

export function RequirementForm({ contact, onContact, text, onText }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-4 md:p-5">
      <p className="text-xs font-semibold uppercase tracking-[1.5px] text-primary">Your requirement</p>
      <textarea
        className={`${field} mt-2 min-h-[72px]`}
        placeholder="What do you need? e.g. 10,000 printed kraft paper bags, 12x10x4 in, delivered in Delhi…"
        value={text}
        onChange={(e) => onText(e.target.value)}
        maxLength={4000}
        aria-label="Your packaging requirement"
      />
      <input
        className={`${field} mt-2 h-10 max-w-xs`}
        placeholder="Your name or brand (optional)"
        value={contact}
        onChange={(e) => onContact(e.target.value)}
        maxLength={200}
        aria-label="Your name or brand"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        Tip: tick “Select” on manufacturers below, then send your requirement to all of them on WhatsApp in one click. Attach photos in the chat.
      </p>
      <a href={GROUP_URL} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-primary underline-offset-4 hover:underline">or post it in our WhatsApp group</a>
    </div>
  );
}
