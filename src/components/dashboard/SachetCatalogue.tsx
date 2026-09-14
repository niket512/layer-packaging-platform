import { useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SEALS = ["Centre seal", "2-side seal", "3-side seal", "4-side seal", "Stand-up (bottom gusset)"];
const FINISHES = ["Matte", "Glossy", "Matte + glossy spot", "Metallised", "Soft touch"];
const FILLS = ["Up to 5 g", "5–20 g", "20–50 g", "50–200 g", "200 g +"];

type Selected = { seal: string; finish: string; fill: string };
const empty: Selected = { seal: "", finish: "", fill: "" };

export default function SachetCatalogue() {
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState<Selected>(empty);

  const chips = [
    sel.seal && { label: `Seal: ${sel.seal}`, clear: () => setSel((s) => ({ ...s, seal: "" })) },
    sel.finish && { label: `Finish: ${sel.finish}`, clear: () => setSel((s) => ({ ...s, finish: "" })) },
    sel.fill && { label: `Fill size: ${sel.fill}`, clear: () => setSel((s) => ({ ...s, fill: "" })) },
    query.trim() && { label: `Search: ${query.trim()}`, clear: () => setQuery("") },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const group = (title: string, options: string[], value: string, onPick: (v: string) => void) => (
    <div>
      <span className="text-[11px] font-semibold uppercase tracking-[1.2px] text-muted-foreground">{title}</span>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o;
          return (
            <button
              key={o}
              onClick={() => onPick(on ? "" : o)}
              aria-pressed={on}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12.5px] transition-colors",
                on
                  ? "border-primary bg-secondary font-semibold text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/50",
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <section>
        <h1 className="font-heading text-[34px] font-semibold leading-[1.12] tracking-tight text-foreground md:text-[38px]">
          Sachets and pouches
        </h1>
        <p className="mt-2 max-w-[560px] text-[14px] text-muted-foreground">
          Flexible packaging designs are being added. Set your seal and finish preferences so we can match makers for
          you
        </p>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            aria-label="Search sachets"
            placeholder="Search sachet styles, finishes or fill sizes..."
            className="h-[50px] w-full rounded-[10px] border border-border bg-card pl-11 pr-4 text-[14px] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
        </div>

        <div className="mt-6 grid gap-5">
          {group("Seal type", SEALS, sel.seal, (v) => setSel((s) => ({ ...s, seal: v })))}
          {group("Finishing", FINISHES, sel.finish, (v) => setSel((s) => ({ ...s, finish: v })))}
          {group("Fill size", FILLS, sel.fill, (v) => setSel((s) => ({ ...s, fill: v })))}
        </div>
      </section>

      {chips.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-card p-3">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-[1.2px] text-muted-foreground">
            Active filters
          </span>
          {chips.map((c) => (
            <button
              key={c.label}
              onClick={c.clear}
              aria-label={`Remove filter ${c.label}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11.5px] text-secondary-foreground transition-colors hover:text-primary"
            >
              {c.label} <X className="h-3 w-3" />
            </button>
          ))}
          <button
            onClick={() => {
              setSel(empty);
              setQuery("");
            }}
            className="ml-1 text-[11.5px] font-semibold text-primary hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-11 text-center">
        <h3 className="font-heading text-[19px] font-semibold text-foreground">No sachet designs yet</h3>
        <p className="mx-auto mt-2 max-w-[420px] text-[13px] text-muted-foreground">
          Sachet catalogues are being onboarded. Your selections stay on screen, and designs will appear here as makers
          are added
        </p>
      </div>
    </>
  );
}
