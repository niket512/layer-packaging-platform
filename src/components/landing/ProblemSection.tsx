import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { AlertTriangle, Layers, Eye, ShieldAlert } from "lucide-react";

const problems = [
  {
    icon: AlertTriangle,
    title: "High MOQs lock out growing brands",
    desc: "Most manufacturers set minimums that don't fit early-stage D2C volumes, forcing brands to overpay or overstock.",
  },
  {
    icon: Layers,
    title: "Too many vendors, no single thread",
    desc: "Brands juggle separate conversations with designers, material suppliers, printers, and converters.",
  },
  {
    icon: Eye,
    title: "Poor visibility across the chain",
    desc: "No single view of where a packaging order stands — sampling, production, QC, or shipment.",
  },
  {
    icon: ShieldAlert,
    title: "Quality is inconsistent",
    desc: "Without standardised QC and verified manufacturer data, every reorder is a gamble.",
  },
];

export default function ProblemSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="bg-muted/40 py-24 md:py-32">
      <div className="container">
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">The problem</p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-heading text-balance sm:text-4xl">
            Packaging execution is broken for D2C
          </h2>
          <p className="mt-4 text-body text-pretty">
            Fragmented supply chains, opaque pricing, and manual coordination make packaging one of the hardest parts of scaling a consumer brand in India.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2">
          {problems.map((p, i) => (
            <div
              key={p.title}
              className={`group rounded-2xl border border-border bg-surface-raised p-7 shadow-sm transition-all duration-500 hover:shadow-md hover:shadow-primary/5 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
              style={{ animationDelay: `${150 + i * 80}ms` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-subtle text-primary transition-transform duration-300 group-hover:scale-105">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-heading">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-body">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
