import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Check, Minus } from "lucide-react";

const features = [
  "Structured packaging spec",
  "Verified manufacturer pool",
  "Sampling coordination",
  "QC checkpoints",
  "Payment tracking",
  "Shipment tracking",
  "Reorder workflows",
  "Demand pooling",
];

const columns = [
  {
    name: "Directories",
    sub: "IndiaMART, etc.",
    values: [false, false, false, false, false, false, false, false],
  },
  {
    name: "Traditional sourcing",
    sub: "Agents & brokers",
    values: [false, true, true, false, false, false, false, false],
  },
  {
    name: "Layer",
    sub: "Packaging infrastructure",
    highlight: true,
    values: [true, true, true, true, true, true, true, true],
  },
];

export default function ComparisonSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="bg-muted/40 py-24 md:py-32">
      <div className="container">
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Comparison</p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-heading text-balance sm:text-4xl">
            Infrastructure, not just discovery
          </h2>
          <p className="mt-4 text-body">
            Directories list suppliers. Marketplaces handle transactions. Layer runs the entire packaging workflow.
          </p>
        </div>

        <div
          className={`mx-auto mt-14 max-w-4xl overflow-x-auto ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
          style={{ animationDelay: "200ms" }}
        >
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="pb-4 pr-4 text-left font-medium text-body-muted" />
                {columns.map((col) => (
                  <th
                    key={col.name}
                    className={`px-4 pb-4 text-center ${col.highlight ? "rounded-t-xl bg-amber-subtle" : ""}`}
                  >
                    <span className={`font-heading text-sm font-semibold ${col.highlight ? "text-heading" : "text-body-muted"}`}>
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
                <tr key={f} className="border-t border-border/50">
                  <td className="py-3 pr-4 text-left font-medium text-heading">{f}</td>
                  {columns.map((col) => (
                    <td
                      key={col.name}
                      className={`px-4 py-3 text-center ${col.highlight ? "bg-amber-subtle" : ""} ${fi === features.length - 1 && col.highlight ? "rounded-b-xl" : ""}`}
                    >
                      {col.values[fi] ? (
                        <Check className={`mx-auto h-4 w-4 ${col.highlight ? "text-primary" : "text-body-muted"}`} />
                      ) : (
                        <Minus className="mx-auto h-4 w-4 text-border" />
                      )}
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
