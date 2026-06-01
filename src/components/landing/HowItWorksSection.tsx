import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const steps = [
  { n: "01", title: "Submit Brief", desc: "Tell us your product, quantity, and timeline." },
  { n: "02", title: "Get Matched", desc: "We surface verified manufacturers that fit your requirements." },
  { n: "03", title: "Review & Approve", desc: "Compare options, approve samples, confirm pricing." },
  { n: "04", title: "Order Placed", desc: "We coordinate with the manufacturer on your behalf." },
  { n: "05", title: "Track to Door", desc: "Real-time visibility on production and shipping status." },
];

export default function HowItWorksSection() {
  const { ref, isVisible } = useScrollReveal();
  return (
    <section ref={ref} id="how-it-works" className="py-12 md:py-20">
      <div className="mx-auto max-w-content px-6">
        <div className={`max-w-2xl ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-primary">The Process</p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Your journey from brief to delivery
          </h2>
        </div>

        {/* Desktop horizontal timeline */}
        <div className="mt-16 hidden md:block">
          <div className="relative">
            <div className="absolute left-0 right-0 top-3 h-px bg-border" />
            <div className="relative grid grid-cols-5 gap-4">
              {steps.map((s, i) => (
                <div
                  key={s.n}
                  className={`flex flex-col items-start ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="relative z-10 h-6 w-6 rounded-full border-2 border-primary bg-background">
                    <div className="absolute inset-1 rounded-full bg-primary" />
                  </div>
                  <span className="mt-4 text-xs font-semibold uppercase tracking-widest text-primary">{s.n}</span>
                  <h3 className="mt-1 font-heading text-base font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile vertical stepper */}
        <div className="mt-12 md:hidden">
          <div className="relative space-y-8">
            <div className="absolute left-3 top-1 bottom-1 w-px bg-border" />
            {steps.map((s) => (
              <div key={s.n} className="relative flex gap-4 pl-1">
                <div className="relative z-10 mt-1 h-6 w-6 shrink-0 rounded-full border-2 border-primary bg-background">
                  <div className="absolute inset-1 rounded-full bg-primary" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary">{s.n}</span>
                  <h3 className="mt-1 font-heading text-base font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
