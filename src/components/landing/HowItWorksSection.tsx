import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const steps = [
  { n: "1", title: "Submit Your Brief", desc: "Share your product, packaging type, quantity, and timeline." },
  { n: "2", title: "Get Matched", desc: "We surface verified manufacturers suited to your requirements." },
  { n: "3", title: "Review & Approve", desc: "Compare options, confirm samples, lock in pricing." },
  { n: "4", title: "Order Managed", desc: "Snaplogo coordinates with the manufacturer end-to-end." },
  { n: "5", title: "Track to Delivery", desc: "Real-time updates on production and shipping, no follow-up needed." },
];

export default function HowItWorksSection() {
  const { ref, isVisible } = useScrollReveal();
  return (
    <section ref={ref} id="how-it-works" className="py-14 md:py-[88px] bg-muted">
      <div className="mx-auto max-w-content px-6">
        <div className={`mx-auto max-w-2xl text-center ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="label-eyebrow">How It Works</p>
          <h2 className="mt-3 font-heading text-[32px] font-semibold tracking-tight text-foreground md:text-[38px]">
            From brief to delivery, in five steps
          </h2>
        </div>

        {/* Desktop */}
        <div className="mt-16 hidden md:block">
          <div className="relative">
            <div className="absolute left-[6%] right-[6%] top-6 h-px bg-border" />
            <div className="relative grid grid-cols-5 gap-4">
              {steps.map((s, i) => (
                <div
                  key={s.n}
                  className={`flex flex-col items-center text-center ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground shadow-md">
                    {s.n}
                  </div>
                  <h3 className="mt-5 font-heading text-base font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="mt-12 md:hidden">
          <div className="relative space-y-8">
            <div className="absolute left-6 top-2 bottom-2 w-px bg-border" />
            {steps.map((s) => (
              <div key={s.n} className="relative flex gap-4">
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
                  {s.n}
                </div>
                <div className="pt-2">
                  <h3 className="font-heading text-base font-semibold text-foreground">{s.title}</h3>
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
