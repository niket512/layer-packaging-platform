import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Check, Factory, Truck, CreditCard, Package } from "lucide-react";

const features = [
  "Real-time order status",
  "Manufacturer communication log",
  "Sample approval workflow",
  "Shipment tracking",
];

const stats = [
  { label: "Active orders", value: "12", sub: "3 in QC" },
  { label: "Manufacturers", value: "47", sub: "Verified" },
  { label: "Pending payments", value: "₹4.2L", sub: "2 due this week" },
];

const orders = [
  {
    name: "Kraft stand-up pouch",
    meta: "Tea brand · 10,000 units",
    manufacturer: "Noida Print Collective",
    location: "Noida, UP",
    ship: "02 Apr 2026",
    payment: "₹92K pending",
    status: "In production",
    statusColor: "bg-primary/10 text-primary",
    progress: 65,
  },
  {
    name: "Custom mailer box",
    meta: "Skincare brand · 5,000 units",
    manufacturer: "Pune Rigid Works",
    location: "Pune, MH",
    ship: "28 Mar 2026",
    payment: "₹1.8L paid",
    status: "QC review",
    statusColor: "bg-amber-500/10 text-amber-600",
    progress: 80,
  },
  {
    name: "Rigid gift box",
    meta: "Fragrance brand · 2,500 units",
    manufacturer: "Ahmedabad Pack Studio",
    location: "Ahmedabad, GJ",
    ship: "Delivered 18 Mar",
    payment: "₹2.1L cleared",
    status: "Shipped",
    statusColor: "bg-emerald-500/10 text-emerald-600",
    progress: 100,
  },
];

export default function DashboardPreviewSection() {
  const { ref, isVisible } = useScrollReveal();
  return (
    <section ref={ref} id="platform" className="py-14 md:py-[88px] bg-muted">
      <div className="mx-auto max-w-content px-6">
        <div className={`max-w-2xl ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="label-eyebrow">The Platform</p>
          <h2 className="mt-3 font-heading text-[32px] font-semibold tracking-tight text-foreground md:text-[38px]">
            Your entire procurement, in one dashboard
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Track orders, manage samples, communicate with manufacturers, and monitor shipments — from a single interface.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-10 md:grid-cols-5">
          <ul className={`space-y-3 md:col-span-2 md:pt-4 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={3} />
                <span className="text-base text-foreground">{f}</span>
              </li>
            ))}
          </ul>

          <div className={`md:col-span-3 ${isVisible ? "animate-reveal-up" : "opacity-0"}`} style={{ animationDelay: "150ms" }}>
            <div className="overflow-hidden rounded-2xl border border-border bg-card card-soft">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 border-b border-border bg-muted px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-muted-foreground">app.snaplogo.in/orders</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                {stats.map((s) => (
                  <div key={s.label} className="p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{s.label}</p>
                    <p className="mt-1.5 text-xl font-semibold text-foreground">{s.value}</p>
                    <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Orders */}
              <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Active orders</p>
                  <span className="text-xs text-muted-foreground">3 of 12</span>
                </div>
                <div className="space-y-2.5">
                  {orders.map((o) => (
                    <div key={o.name} className="rounded-lg border border-border bg-background p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{o.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{o.meta}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${o.statusColor}`}>
                          {o.status}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${o.progress}%` }} />
                      </div>
                      <div className="mt-2.5 grid grid-cols-3 gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Factory className="h-3 w-3 text-primary/70" />
                          <span className="truncate text-foreground">{o.manufacturer}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Truck className="h-3 w-3 text-primary/70" />
                          <span className="truncate text-foreground">{o.ship}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <CreditCard className="h-3 w-3 text-primary/70" />
                          <span className="truncate text-foreground">{o.payment}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">Dashboard preview</p>
          </div>
        </div>
      </div>
    </section>
  );
}
