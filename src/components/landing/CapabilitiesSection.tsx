import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { ShieldCheck, Zap } from "lucide-react";
import bg from "@/assets/capabilities-bg.jpg";

const points = [
  {
    icon: ShieldCheck,
    title: "Verified manufacturers, consistent quality",
    desc: "Every supplier is vetted. Standardised QC checkpoints and auditable production records mean fewer surprises and repeatable output across reorders.",
  },
  {
    icon: Zap,
    title: "Faster cycles, fewer vendors",
    desc: "Structured briefs and matched capacity cut time-to-sample and time-to-production. One interface replaces a dozen contacts and scattered spreadsheets.",
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
        <div className={`mx-auto grid max-w-5xl gap-6 md:grid-cols-2 ${isVisible ? "" : "opacity-0"}`}>
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
