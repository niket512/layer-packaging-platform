import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Search, BadgeIndianRupee, Scale, FlaskConical, Handshake, Truck } from "lucide-react";

const steps = [
  { n: "1", title: "Submit Your Brief", desc: "Share your product, packaging type, quantity, and timeline." },
  { n: "2", title: "Get Matched", desc: "We surface verified manufacturers suited to your requirements." },
  { n: "3", title: "Review & Approve", desc: "Compare options, confirm samples, lock in pricing." },
  { n: "4", title: "Order Managed", desc: "Snaplogo coordinates with the manufacturer end-to-end." },
  { n: "5", title: "Track to Delivery", desc: "Real-time updates on production and shipping, no follow-up needed." },
];

const tiles = [
  { icon: Search, title: "Find the Right Manufacturer", desc: "Access a curated network of verified packaging partners without making 100 calls" },
  { icon: BadgeIndianRupee, title: "Fair Pricing", desc: "Transparent quotes upfront. No bait-and-switch, no hidden markups for small quantities" },
  { icon: Scale, title: "Flexible MOQs", desc: "Work with manufacturers set up for emerging brand volumes, not just large-scale runs" },
  { icon: FlaskConical, title: "Sample & Approval Management", desc: "Coordinate samples and sign-offs in one clean thread, not over WhatsApp" },
  { icon: Handshake, title: "Managed Coordination", desc: "Snaplogo handles manufacturer communication so your team stays focused on the brand" },
  { icon: Truck, title: "Live Order Tracking", desc: "Know exactly where your order is — from production floor to your warehouse door" },
];

export default function HowItWorksSection() {
  const { ref, isVisible } = useScrollReveal();
  return (
    <section ref={ref} id="how-it-works" className="py-14 md:py-[88px] bg-muted">
      <div className="mx-auto max-w-content px-6">
        <div className={`mx-auto max-w-2xl text-center ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="label-eyebrow">How Snaplogo Works</p>
          <h2 className="mt-3 font-heading text-[32px] font-semibold tracking-tight text-foreground md:text-[38px]">
            From brief to delivery — and everything that makes it work
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Five simple steps move your order from inquiry to your warehouse. Behind each step, Snaplogo handles the sourcing, pricing, samples, and coordination — so you can procure with confidence.
          </p>
        </div>


        {/* Steps — Desktop */}
        <div className="mt-16 hidden md:block">
          <div className="relative px-4">
            <div className="absolute left-[10%] right-[10%] top-6 h-px bg-border" />
            <div className="relative grid grid-cols-5 gap-6">
              {steps.map((s, i) => (
                <div
                  key={s.n}
                  className={`flex min-w-0 flex-col items-center px-2 text-center ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
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

        {/* Steps — Mobile */}
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

        {/* What powers each step */}
        <div className={`mx-auto mt-20 md:mt-24 max-w-2xl text-center ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="text-base leading-relaxed text-muted-foreground">
            What powers every step — the capabilities working quietly in the background.
          </p>
        </div>


        <div className="mt-12 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {tiles.map((t, i) => (
            <div
              key={t.title}
              className={`flex h-full flex-col rounded-2xl border border-border bg-card p-7 card-soft transition-colors hover:border-primary/40 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <t.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">{t.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
