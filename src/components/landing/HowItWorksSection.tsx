import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { PenLine, Users, ClipboardCheck, Boxes, Truck } from "lucide-react";

const steps = [
  {
    n: "1",
    icon: PenLine,
    title: "Tell us the brief",
    desc: "Product, packaging type, quantity, timeline. A few lines is enough — sketches and photos welcome.",
  },
  {
    n: "2",
    icon: Users,
    title: "We shortlist humans",
    desc: "Two or three verified manufacturers we'd trust with our own brand. No 40-tab quote dumps.",
  },
  {
    n: "3",
    icon: ClipboardCheck,
    title: "Samples & sign-off",
    desc: "Hold the real thing in your hands before you commit. We chase the revisions, you approve.",
  },
  {
    n: "4",
    icon: Boxes,
    title: "Production, watched",
    desc: "Our team sits on the WhatsApp groups and factory calls so you don't have to.",
  },
  {
    n: "5",
    icon: Truck,
    title: "On the truck",
    desc: "Live tracking from press to your warehouse. We flag delays before they become problems.",
  },
];

export default function HowItWorksSection() {
  const { ref, isVisible } = useScrollReveal();
  return (
    <section ref={ref} id="how-it-works" className="py-14 md:py-[88px] bg-muted">
      <div className="mx-auto max-w-content px-6">
        <div className={`mx-auto max-w-2xl text-center ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="label-eyebrow">How it actually works</p>
          <h2 className="mt-3 font-heading text-[32px] font-semibold tracking-tight text-foreground md:text-[38px]">
            From a rough brief to boxes on your shelf
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Five steps, mostly done for you. We keep the back-and-forth off your plate so you can stay focused on the brand.
          </p>
          <p className="handwritten mt-3 text-lg text-primary/80">
            most brands close their first order in ~12 days.
          </p>
        </div>

        {/* Steps — Desktop */}
        <div className="mt-16 hidden md:block">
          <div className="relative px-4">
            <div className="absolute left-[10%] right-[10%] top-7 h-px bg-border" />
            <div className="relative grid grid-cols-5 gap-6">
              {steps.map((s, i) => (
                <div
                  key={s.n}
                  className={`flex min-w-0 flex-col items-center px-2 text-center ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-background text-primary shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.6)]">
                    <s.icon className="h-6 w-6" strokeWidth={1.6} />
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                      {s.n}
                    </span>
                  </div>
                  <h3 className="mt-5 font-heading text-base font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Steps — Mobile */}
        <div className="mt-12 md:hidden">
          <div className="relative space-y-8">
            <div className="absolute left-7 top-2 bottom-2 w-px bg-border" />
            {steps.map((s) => (
              <div key={s.n} className="relative flex gap-4">
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-background text-primary">
                  <s.icon className="h-6 w-6" strokeWidth={1.6} />
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    {s.n}
                  </span>
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
