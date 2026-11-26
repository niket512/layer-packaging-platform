import type { Filters } from "@/lib/catalogue";
import { capacities, closureTags } from "@/lib/catalogue";


type Props = {
  filters: Filters;
  set: (patch: Partial<Filters>) => void;
  reset: () => void;
};

const selectClass =
  "h-8 rounded-lg border border-border bg-background px-2 text-[12.5px] text-foreground outline-hidden transition-colors focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="inline-flex items-center gap-1.5">
      <span className="text-[10.5px] font-semibold uppercase tracking-[1px] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export default function FilterSidebar({ filters, set, reset }: Props) {

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border bg-card px-3 py-2">
      <strong className="text-[10.5px] font-semibold uppercase tracking-[1px] text-muted-foreground">
        Refine your search
      </strong>

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

      <button onClick={reset} className="ml-auto text-[12px] font-semibold text-primary hover:underline">
        Reset all
      </button>
    </div>
  );
}
