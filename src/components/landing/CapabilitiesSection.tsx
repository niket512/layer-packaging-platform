import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { TrendingDown, ShieldCheck, Zap, Users, Eye, RotateCcw } from "lucide-react";

const capabilities = [
  { icon: TrendingDown, title: "Lower MOQs", desc: "Pool demand across brands and unlock minimum order quantities that work for growing companies." },
  { icon: ShieldCheck, title: "Quality consistency", desc: "Verified manufacturers, standardised QC checkpoints, and auditable production records." },
  { icon: Zap, title: "Faster cycles", desc: "Structured briefs and pooled capacity cut time-to-sample and time-to-production significantly." },
  { icon: Users, title: "Fewer vendors", desc: "Stop juggling ten different contacts. Layer consolidates your packaging supply chain into one interface." },
  { icon: Eye, title: "Full visibility", desc: "Track every order from sampling through shipment with real-time status and payment milestones." },
  { icon: RotateCcw, title: "Repeatable production", desc: "Save specs, approved samples, and manufacturer preferences. Reorder with one click." },
];

export default function CapabilitiesSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} id="capabilities" className="py-24 md:py-32">
      <div className="container">
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Capabilities</p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-heading text-balance sm:text-4xl">
            Operational advantages that compound
          </h2>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => (
            <div
              key={c.title}
              className={`group rounded-2xl border border-border bg-surface-raised p-6 transition-all duration-500 hover:shadow-md hover:shadow-primary/5 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
              style={{ animationDelay: `${150 + i * 70}ms` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-subtle text-primary transition-transform duration-300 group-hover:scale-105">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-heading text-base font-semibold text-heading">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-body">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
