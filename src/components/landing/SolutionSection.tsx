import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Factory, Package, Truck } from "lucide-react";

const features = [
  { icon: Factory, title: "Verified Manufacturers", desc: "Onboarded, quality-checked, flexible MOQ partners." },
  { icon: Package, title: "Managed Coordination", desc: "Requirements captured once, communicated clearly." },
  { icon: Truck, title: "Live Order Tracking", desc: "Know your order status without chasing anyone." },
];

export default function SolutionSection() {
  const { ref, isVisible } = useScrollReveal();
  return (
    <section ref={ref} id="why-snaplogo" className="py-12 md:py-20">
      <div className="mx-auto max-w-content px-6">
        <div className={`max-w-2xl ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-primary">How Snaplogo Helps</p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            One platform. From discovery to delivery.
          </h2>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Snaplogo replaces the chaos of broker calls and spreadsheets with a verified network, smart coordination tools, and real-time order tracking.
          </p>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={isVisible ? "animate-reveal-up" : "opacity-0"}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-heading text-xl font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
