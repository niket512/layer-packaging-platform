import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Search, BadgeIndianRupee, Scale, FlaskConical, Handshake, Truck } from "lucide-react";

const tiles = [
  { icon: Search, title: "Find the Right Manufacturer", desc: "Access a curated network of verified packaging partners without making 100 calls" },
  { icon: BadgeIndianRupee, title: "Fair Pricing, No Surprises", desc: "Transparent quotes upfront. No bait-and-switch, no hidden markups for small quantities" },
  { icon: Scale, title: "Flexible MOQs", desc: "Work with manufacturers set up for emerging brand volumes, not just large-scale runs" },
  { icon: FlaskConical, title: "Sample & Approval Management", desc: "Coordinate samples and sign-offs in one clean thread, not over WhatsApp" },
  { icon: Handshake, title: "Managed Coordination", desc: "Snaplogo handles manufacturer communication so your team stays focused on the brand" },
  { icon: Truck, title: "Live Order Tracking", desc: "Know exactly where your order is — from production floor to your warehouse door" },
];

export default function CapabilitiesSection() {
  const { ref, isVisible } = useScrollReveal();
  return (
    <section ref={ref} id="capabilities" className="py-14 md:py-20 bg-background">
      <div className="mx-auto max-w-content px-[5vw] md:px-8">
        <div className={`mx-auto max-w-2xl text-center ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="label-eyebrow">How Snaplogo Helps</p>
          <h2 className="mt-3 font-heading text-[32px] font-semibold tracking-tight text-foreground md:text-[38px]">
            Everything you need to procure with confidence
          </h2>
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
