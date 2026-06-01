import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Check, CheckCheck, X } from "lucide-react";

type Cell = "no" | "yes" | "best";

const features: { label: string; values: [Cell, Cell, Cell] }[] = [
  { label: "Structured packaging spec", values: ["no", "no", "best"] },
  { label: "Verified manufacturer pool", values: ["no", "yes", "best"] },
  { label: "Sampling coordination", values: ["no", "yes", "yes"] },
  { label: "QC checkpoints", values: ["no", "no", "best"] },
  { label: "Payment tracking", values: ["no", "no", "best"] },
  { label: "Shipment tracking", values: ["no", "no", "yes"] },
  { label: "Reorder workflows", values: ["no", "no", "best"] },
];

const columns = [
  { name: "Directories", sub: "IndiaMART, etc." },
  { name: "Traditional sourcing", sub: "Agents & brokers" },
  { name: "Snaplogo", sub: "Packaging infrastructure", highlight: true },
];

function CellIcon({ value }: { value: Cell }) {
  if (value === "no") return <X className="mx-auto h-5 w-5 text-red-500" />;
  if (value === "best")
    return <CheckCheck className="mx-auto h-5 w-5 text-green-600" />;
  return <Check className="mx-auto h-5 w-5 text-green-600" />;
}

export default function ComparisonSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} id="comparison" className="bg-muted/40 py-16 md:py-20">
      <div className="container">
        <div className={`mx-auto max-w-2xl text-center transition-all duration-700 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Comparison</p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-heading text-balance sm:text-4xl">
            Infrastructure, not just discovery
          </h2>
          <p className="mt-4 text-body">
            Directories list suppliers. Marketplaces handle transactions. Snaplogo runs the entire packaging workflow.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-body-muted">
            <span className="flex items-center gap-1.5"><CheckCheck className="h-4 w-4 text-green-600" /> Most relevant</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-600" /> Supported</span>
            <span className="flex items-center gap-1.5"><X className="h-4 w-4 text-red-500" /> Not supported</span>
          </div>
        </div>

        <div className={`mx-auto mt-12 max-w-4xl overflow-x-auto ${isVisible ? "animate-reveal-up" : "opacity-0"}`} style={{ animationDelay: "200ms" }}>
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="pb-4 pr-4 text-left font-medium text-body-muted" />
                {columns.map((col) => (
                  <th
                    key={col.name}
                    className={`px-4 pb-4 text-center ${col.highlight ? "rounded-t-xl bg-primary/10" : ""}`}
                  >
                    <span className={`font-heading text-sm font-semibold ${col.highlight ? "text-primary" : "text-body-muted"}`}>
                      {col.name}
                    </span>
                    <br />
                    <span className="text-xs text-body-muted">{col.sub}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((f, fi) => (
                <tr key={f.label} className="border-t border-border/50">
                  <td className="py-3 pr-4 text-left font-medium text-heading">{f.label}</td>
                  {f.values.map((v, ci) => (
                    <td
                      key={ci}
                      className={`px-4 py-3 text-center ${columns[ci].highlight ? "bg-primary/10" : ""} ${fi === features.length - 1 && columns[ci].highlight ? "rounded-b-xl" : ""}`}
                    >
                      <CellIcon value={v} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
