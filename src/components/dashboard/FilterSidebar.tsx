import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Filters } from "@/lib/catalogue";
import { capacities, closureTags, featureTags, shoulderTags } from "@/lib/catalogue";
import { cn } from "@/lib/utils";

type Props = {
  filters: Filters;
  set: (patch: Partial<Filters>) => void;
  reset: () => void;
};

const selectClass =
  "mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-[13px] text-foreground outline-none transition-colors focus:border-primary";

function Field({ label, children, note }: { label: string; children: React.ReactNode; note?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[1.2px] text-muted-foreground">{label}</span>
      {children}
      {note && <span className="mt-1.5 block text-[11px] leading-snug text-muted-foreground">{note}</span>}
    </label>
  );
}

export default function FilterSidebar({ filters, set, reset }: Props) {
  const [more, setMore] = useState(Boolean(filters.shoulder));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <strong className="text-[13px] font-semibold text-foreground">Refine your search</strong>
        <button onClick={reset} className="text-[12px] font-semibold text-primary hover:underline">
          Reset all
        </button>
      </div>

      <Field label="Capacity" note="Listed volumes printed on the catalogue">
        <select className={selectClass} value={filters.capacity} onChange={(e) => set({ capacity: e.target.value })}>
          <option value="">All capacities</option>
          {capacities.map((c) => (
            <option key={c} value={c}>{c.toLocaleString()} ml</option>
          ))}
        </select>
      </Field>

      <Field label="Closure type">
        <select className={selectClass} value={filters.closure} onChange={(e) => set({ closure: e.target.value })}>
          <option value="">Any closure</option>
          {closureTags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </Field>

      <Field label="Body feature">
        <select className={selectClass} value={filters.feature} onChange={(e) => set({ feature: e.target.value })}>
          <option value="">Any body feature</option>
          {featureTags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </Field>

      <button
        onClick={() => setMore((v) => !v)}
        aria-expanded={more}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 text-[12.5px] font-semibold text-foreground transition-colors hover:border-primary/60"
      >
        More filters
        <ChevronDown className={cn("h-4 w-4 transition-transform", more && "rotate-180")} />
      </button>

      {more && (
        <div className="space-y-4">
          <Field label="Shoulder or neck">
            <select className={selectClass} value={filters.shoulder} onChange={(e) => set({ shoulder: e.target.value })}>
              <option value="">Any shoulder or neck</option>
              {shoulderTags.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
        </div>
      )}

    </div>
  );
}
