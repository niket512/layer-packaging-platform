import type { Filters } from "@/lib/catalogue";
import { capacities, featureTags, manufacturers, materials, shoulderTags, sources } from "@/lib/catalogue";

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
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <strong className="text-[13px] font-semibold text-foreground">Refine your search</strong>
        <button onClick={reset} className="text-[12px] font-semibold text-primary hover:underline">
          Reset all
        </button>
      </div>

      <Field label="Material">
        <select className={selectClass} value={filters.material} onChange={(e) => set({ material: e.target.value })}>
          <option value="">All materials</option>
          {materials.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </Field>

      <Field label="Manufacturer">
        <select className={selectClass} value={filters.manufacturer} onChange={(e) => set({ manufacturer: e.target.value })}>
          <option value="">All manufacturers</option>
          {manufacturers.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </Field>

      <Field label="Listed capacity" note="Exact printed volumes. Ranges appear under all capacities">
        <select className={selectClass} value={filters.capacity} onChange={(e) => set({ capacity: e.target.value })}>
          <option value="">All capacities</option>
          {capacities.map((c) => (
            <option key={c} value={c}>{c} ml</option>
          ))}
        </select>
      </Field>

      <Field label="Shoulder">
        <select className={selectClass} value={filters.shoulder} onChange={(e) => set({ shoulder: e.target.value })}>
          <option value="">Any shoulder</option>
          {shoulderTags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </Field>

      <Field label="Closure or body feature">
        <select className={selectClass} value={filters.feature} onChange={(e) => set({ feature: e.target.value })}>
          <option value="">Any feature</option>
          {featureTags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </Field>

      <Field label="Catalogue">
        <select className={selectClass} value={filters.source} onChange={(e) => set({ source: e.target.value })}>
          <option value="">All {sources.length} catalogues</option>
          {sources.map((s) => (
            <option key={s.key} value={s.key}>{s.manufacturer} — {s.name}</option>
          ))}
        </select>
      </Field>

      <label className="flex items-center gap-2 text-[13px] text-foreground">
        <input
          type="checkbox"
          checked={filters.reviewOnly}
          onChange={(e) => set({ reviewOnly: e.target.checked })}
          className="h-4 w-4 accent-[hsl(var(--primary))]"
        />
        Show entries needing confirmation
      </label>

      <p className="rounded-xl bg-muted p-3 text-[11px] leading-relaxed text-muted-foreground">
        Specifications come from supplied catalogues. A listed product is subject to supplier confirmation
      </p>
    </div>
  );
}
