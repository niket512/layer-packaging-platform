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
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-[13px] text-foreground outline-none transition-colors focus:border-primary";

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn("block min-w-[160px] flex-1", className)}>
      <span className="text-[10.5px] font-semibold uppercase tracking-[1.2px] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export default function FilterSidebar({ filters, set, reset }: Props) {
  const [more, setMore] = useState(Boolean(filters.shoulder));

  return (
    <div className="mt-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <strong className="text-[11px] font-semibold uppercase tracking-[1.2px] text-muted-foreground">
          Refine your search
        </strong>
        <button onClick={reset} className="text-[12px] font-semibold text-primary hover:underline">
          Reset all
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-3">
        <Field label="Capacity">
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

      </div>
    </div>
  );
}
