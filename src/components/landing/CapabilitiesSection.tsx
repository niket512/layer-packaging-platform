import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Search, Scale, Tag, FlaskConical, MessagesSquare, Truck } from "lucide-react";

const tiles = [
  { icon: Search, title: "Manufacturer Discovery", desc: "Find vetted partners without wasting weeks on cold calls." },
  { icon: Scale, title: "MOQ Flexibility", desc: "Access manufacturers who work with emerging brand volumes." },
  { icon: Tag, title: "Transparent Pricing", desc: "No bait-and-switch. Clear quotes before commitment." },
  { icon: FlaskConical, title: "Sample Management", desc: "Coordinate samples and approvals in one thread." },
  { icon: MessagesSquare, title: "Order Coordination", desc: "We handle the back-and-forth so your team doesn't have to." },
  { icon: Truck, title: "Shipment Tracking", desc: "End-to-end visibility from factory floor to your warehouse." },
];

export default function CapabilitiesSection() {
  const { ref, isVisible } = useScrollReveal();
  return (
    <section ref={ref} id="capabilities" className="py-12 md:py-20">
      <div className="mx-auto max-w-content px-6">
        <div className={`max-w-2xl ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-primary">Capabilities</p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Everything a brand needs to procure with confidence
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {tiles.map((t, i) => (
            <div
              key={t.title}
              className={`flex h-full flex-col rounded-2xl border border-border bg-card p-7 transition-colors hover:border-primary/40 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <t.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-heading text-xl font-semibold text-foreground">{t.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
