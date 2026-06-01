import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { TrendingDown, ShieldCheck, Zap, Users, Eye, RotateCcw } from "lucide-react";
import bg from "@/assets/capabilities-bg.jpg";

const points = [
  {
    icon: TrendingDown,
    title: "Lower MOQs",
    desc: "We find cost-efficient manufacturers who support minimum order quantities that work for growing brands.",
  },
  {
    icon: ShieldCheck,
    title: "Quality consistency",
    desc: "Verified manufacturers, standardised QC checkpoints, and auditable production records.",
  },
  {
    icon: Zap,
    title: "Faster cycles",
    desc: "Structured briefs and matched capacity cut time-to-sample and time-to-production significantly.",
  },
  {
    icon: Users,
    title: "Fewer vendors",
    desc: "Stop juggling ten different contacts. Snaplogo consolidates your packaging supply chain into one interface.",
  },
  {
    icon: Eye,
    title: "Full visibility",
    desc: "Track every order from sampling through shipment with real-time status and payment milestones.",
  },
  {
    icon: RotateCcw,
    title: "Repeatable production",
    desc: "Save specs, approved samples, and manufacturer preferences. Reorder with one click.",
  },
];

export default function CapabilitiesSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="relative overflow-hidden py-16 md:py-24">
      <img
        src={bg}
        alt=""
        aria-hidden="true"
        loading="lazy"
        width={1600}
        height={900}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />

      <div className="container relative">
        <div className={`mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3 ${isVisible ? "" : "opacity-0"}`}>
          {points.map((p, i) => (
            <div
              key={p.title}
              className={`flex items-start gap-4 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <p.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-heading">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-body">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
