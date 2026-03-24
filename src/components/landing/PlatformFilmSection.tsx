import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Package, Factory, Truck, CreditCard, MapPin } from "lucide-react";

const stats = [
  { label: "Active orders", value: "12", sub: "3 in QC", icon: Package },
  { label: "Manufacturers", value: "47", sub: "Verified", icon: Factory },
  { label: "Avg. lead time", value: "18d", sub: "↓ 22% vs Q3", icon: Clock },
  { label: "Pending payments", value: "₹4.2L", sub: "2 due this week", icon: CreditCard },
];

const orders = [
  {
    name: "Custom mailer box",
    brand: "Skincare brand",
    units: "5,000 units",
    manufacturer: "Pune Rigid Works",
    location: "Pune, MH",
    status: "In production",
    statusColor: "text-primary",
    statusBg: "bg-primary/10",
    shipDate: "28 Mar 2026",
    payment: "₹1.8L paid",
    progress: 65,
  },
  {
    name: "Kraft pouch",
    brand: "Tea brand",
    units: "10,000 units",
    manufacturer: "Noida Print Collective",
    location: "Noida, UP",
    status: "QC review",
    statusColor: "text-amber-600",
    statusBg: "bg-amber-500/10",
    shipDate: "02 Apr 2026",
    payment: "₹92K pending",
    progress: 80,
  },
  {
    name: "Rigid gift box",
    brand: "Fragrance brand",
    units: "2,500 units",
    manufacturer: "Ahmedabad Pack Studio",
    location: "Ahmedabad, GJ",
    status: "Shipped",
    statusColor: "text-emerald-600",
    statusBg: "bg-emerald-500/10",
    shipDate: "Delivered 18 Mar",
    payment: "₹2.1L cleared",
    progress: 100,
  },
  {
    name: "Mono carton",
    brand: "Snack brand",
    units: "20,000 units",
    manufacturer: "Chennai Carton Co.",
    location: "Chennai, TN",
    status: "Awaiting approval",
    statusColor: "text-body-muted",
    statusBg: "bg-muted",
    shipDate: "Est. 15 Apr 2026",
    payment: "Quote: ₹3.4L",
    progress: 15,
  },
];

export default function PlatformFilmSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} id="platform-film" className="bg-muted/40 py-24 md:py-32">
      <div className="container">
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Your sourcing OS</p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-heading text-balance sm:text-4xl">
            Every order, manufacturer, and shipment — one dashboard
          </h2>
          <p className="mt-4 text-body">
            Track units, manage manufacturers, monitor shipping dates, and handle payments across all your active orders.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-5xl">
          <div
            className={`relative overflow-hidden rounded-[1.75rem] border border-border bg-surface-raised shadow-2xl shadow-primary/5 ${isVisible ? "animate-reveal-scale" : "opacity-0"}`}
            style={{ animationDelay: "200ms" }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between border-b border-border/70 bg-muted/40 px-5 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400/70" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
                  <span className="h-3 w-3 rounded-full bg-green-400/70" />
                </div>
                <span className="text-xs font-medium text-body-muted">Layer — Orders</span>
              </div>
              <span className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-body-muted">
                Live dashboard
              </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-px border-b border-border/70 bg-border/40 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-background p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <s.icon className="h-4 w-4 text-primary/70" />
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-body-muted">{s.label}</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-heading">{s.value}</p>
                  <p className="mt-1 text-xs text-body-muted">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Orders table */}
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4 pb-4">
                <h3 className="font-heading text-base font-semibold text-heading">Active orders</h3>
                <span className="text-xs text-body-muted">4 orders</span>
              </div>

              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.name}
                    className="rounded-2xl border border-border/70 bg-background p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      {/* Left: Order + manufacturer */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-3 sm:justify-start">
                          <div>
                            <p className="text-sm font-semibold text-heading">{order.name}</p>
                            <p className="text-xs text-body-muted">{order.brand} · {order.units}</p>
                          </div>
                          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${order.statusBg} ${order.statusColor}`}>
                            {order.status}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${order.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-body-muted">Manufacturer</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <Factory className="h-3 w-3 text-primary/60" />
                          <p className="text-xs font-medium text-heading">{order.manufacturer}</p>
                        </div>
                        <p className="text-[10px] text-body-muted">{order.location}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-body-muted">Ship date</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <Truck className="h-3 w-3 text-primary/60" />
                          <p className="text-xs font-medium text-heading">{order.shipDate}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-body-muted">Payment</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <CreditCard className="h-3 w-3 text-primary/60" />
                          <p className="text-xs font-medium text-heading">{order.payment}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-body-muted">Progress</p>
                        <p className="mt-1 text-xs font-semibold text-heading">{order.progress}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface-raised/60 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
