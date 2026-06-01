import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Search, BadgeDollarSign, RadioTower, Zap } from "lucide-react";

const pains = [
  { icon: Search, title: "Manufacturer Discovery", desc: "Talking to 100 suppliers to find one that fits." },
  { icon: BadgeDollarSign, title: "Unfair Pricing", desc: "40–50% premiums for small quantities. Advance payments with no guarantees." },
  { icon: RadioTower, title: "Zero Visibility", desc: "Once the order is placed, you're in the dark on status, quality, and timelines." },
  { icon: Zap, title: "Coordination Overload", desc: "Managing manufacturers across WhatsApp, calls, and emails — with no single source of truth." },
];

export default function ProblemSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="py-12 md:py-20">
      <div className="mx-auto max-w-content px-6">
        <div className={`max-w-2xl ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-primary">The Problem</p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Procurement the way it runs today is broken
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {pains.map((p, i) => (
            <div
              key={p.title}
              className={`rounded-2xl border border-border bg-card p-7 shadow-sm transition-colors hover:border-primary/40 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-heading text-xl font-semibold text-foreground">{p.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
