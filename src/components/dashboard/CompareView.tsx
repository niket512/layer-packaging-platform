import { X } from "lucide-react";
import type { Product } from "@/lib/catalogue";

type Props = {
  items: Product[];
  onRemove: (id: string) => void;
  onClear: () => void;
};

const rows: { label: string; key: keyof Product }[] = [
  { label: "Manufacturer", key: "manufacturer" },
  { label: "Material", key: "material" },
  { label: "Capacity", key: "capacity_raw" },
  { label: "Neck size", key: "neck" },
  { label: "Body diameter", key: "diameter" },
  { label: "Total height", key: "height" },
  { label: "Weight", key: "weight" },
  { label: "Product code", key: "codes" },
  { label: "Design family", key: "design" },
];

export default function CompareView({ items, onRemove, onClear }: Props) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <p className="font-heading text-lg font-semibold text-foreground">Nothing to compare yet</p>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Add products from the catalogue to see their specifications side by side
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-foreground">Comparing {items.length} products</h2>
        <button onClick={onClear} className="text-[12px] font-semibold text-primary hover:underline">
          Clear all
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[640px] border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="w-36 border-b border-border p-3 text-left text-[11px] font-semibold uppercase tracking-[1.2px] text-muted-foreground">
                Specification
              </th>
              {items.map((p) => (
                <th key={p.id} className="border-b border-l border-border p-3 text-left align-top">
                  {p.image && (
                    <img src={p.image} alt={p.name} loading="lazy" className="mb-2 h-28 w-full object-contain" />
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-heading text-[13px] font-semibold text-foreground">{p.name}</span>
                    <button onClick={() => onRemove(p.id)} aria-label={`Remove ${p.name}`} className="text-muted-foreground hover:text-primary">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td className="border-b border-border p-3 text-muted-foreground">{r.label}</td>
                {items.map((p) => (
                  <td key={p.id} className="border-b border-l border-border p-3 font-medium text-foreground">
                    {(p[r.key] as string) || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
