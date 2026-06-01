import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Check, X } from "lucide-react";

const rows: { feature: string; old: string; snap: string }[] = [
  { feature: "Manufacturer Discovery", old: "100 calls, weeks of effort", snap: "Matched in hours" },
  { feature: "Pricing Transparency", old: "Bait-and-switch quotes", snap: "Clear pricing upfront" },
  { feature: "MOQ Flexibility", old: "Built for large brands only", snap: "Emerging-brand friendly" },
  { feature: "Order Coordination", old: "WhatsApp chaos", snap: "Managed, single thread" },
  { feature: "Order Visibility", old: "Silent after payment", snap: "Live tracking dashboard" },
  { feature: "Quality Consistency", old: "Hit or miss post-sample", snap: "Verified, monitored partners" },
];

export default function ComparisonSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} id="why-snaplogo" className="py-14 md:py-[88px] bg-background">
      <div className="mx-auto max-w-content px-6">
        <div className={`mx-auto max-w-2xl text-center ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="label-eyebrow">Why Snaplogo</p>
          <h2 className="mt-3 font-heading text-[32px] font-semibold tracking-tight text-foreground md:text-[38px]">
            The smarter alternative to brokers and directories
          </h2>
        </div>

        <div className={`mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-border card-soft ${isVisible ? "animate-reveal-up" : "opacity-0"}`} style={{ animationDelay: "150ms" }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="px-5 py-4 text-left font-heading text-sm font-semibold">Feature</th>
                  <th className="px-5 py-4 text-left font-heading text-sm font-semibold">The Old Way</th>
                  <th className="px-5 py-4 text-left font-heading text-sm font-semibold">Snaplogo</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.feature} className={i % 2 === 0 ? "bg-background" : "bg-muted"}>
                    <td className="px-5 py-4 font-semibold text-foreground">{r.feature}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <X className="h-4 w-4 text-destructive" />
                        {r.old}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-primary">
                      <span className="inline-flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        {r.snap}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
