import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Factory, Truck, CreditCard, LogOut } from "lucide-react";
import { getBrand, clearBrand } from "@/lib/brand-session";
import logo from "@/assets/snaplogo-orange.png";

const stats = [
  { label: "Active orders", value: "12", sub: "3 in QC" },
  { label: "Manufacturers", value: "47", sub: "Verified" },
  { label: "Pending payments", value: "₹4.2L", sub: "2 due this week" },
  { label: "On-time delivery", value: "98%", sub: "Last 90 days" },
];

const orders = [
  {
    name: "Kraft stand-up pouch",
    meta: "Tea range · 10,000 units",
    manufacturer: "Noida Print Collective",
    ship: "02 Apr 2026",
    payment: "₹92K pending",
    status: "In production",
    statusColor: "bg-primary/10 text-primary",
    progress: 65,
  },
  {
    name: "Custom mailer box",
    meta: "Hamper packs · 5,000 units",
    manufacturer: "Pune Rigid Works",
    ship: "28 Mar 2026",
    payment: "₹1.8L paid",
    status: "QC review",
    statusColor: "bg-amber-500/10 text-amber-600",
    progress: 80,
  },
  {
    name: "Printed label roll",
    meta: "Cold-pressed oils · 25,000 units",
    manufacturer: "Ahmedabad Pack Studio",
    ship: "Delivered 18 Mar",
    payment: "₹2.1L cleared",
    status: "Shipped",
    statusColor: "bg-emerald-500/10 text-emerald-600",
    progress: 100,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [brand, setBrand] = useState<string | null>(null);

  useEffect(() => {
    const b = getBrand();
    if (!b) {
      navigate("/signin", { replace: true });
      return;
    }
    setBrand(b);
  }, [navigate]);

  if (!brand) return null;

  const onSignOut = () => {
    clearBrand();
    navigate("/signin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-muted">
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-5 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Snaplogo" className="h-7 w-7 object-contain" />
            <span className="font-heading text-lg font-bold tracking-tight text-foreground">Snaplogo</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-secondary px-3 py-1 text-[12px] font-semibold text-primary sm:block">
              {brand}
            </span>
            <button
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[12px] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-content px-5 py-10 md:px-8 md:py-14">
        <p className="text-[12px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">Brand dashboard</p>
        <h1 className="mt-2 font-heading text-[30px] font-semibold tracking-tight text-foreground md:text-[38px]">
          Welcome back, {brand}
        </h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Here's where your packaging orders stand today.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{s.label}</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{s.value}</p>
              <p className="text-[12px] text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-foreground">Active orders</h2>
            <span className="text-xs text-muted-foreground">3 of 12</span>
          </div>
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.name} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-foreground">{o.name}</p>
                    <p className="truncate text-[13px] text-muted-foreground">{o.meta}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${o.statusColor}`}>
                    {o.status}
                  </span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${o.progress}%` }} />
                </div>
                <div className="mt-3 grid gap-2 text-[12px] sm:grid-cols-3">
                  <div className="flex items-center gap-1.5">
                    <Factory className="h-3.5 w-3.5 text-primary/70" />
                    <span className="truncate text-foreground">{o.manufacturer}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-primary/70" />
                    <span className="truncate text-foreground">{o.ship}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-primary/70" />
                    <span className="truncate text-foreground">{o.payment}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
