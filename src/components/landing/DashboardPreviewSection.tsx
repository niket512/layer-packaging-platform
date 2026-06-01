import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Check } from "lucide-react";

const features = [
  "Real-time order status",
  "Manufacturer communication log",
  "Sample approval workflow",
  "Shipment tracking",
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

        <div className="mt-12 grid items-center gap-10 md:grid-cols-5">
          <ul className={`space-y-4 md:col-span-2 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                  <Check className="h-4 w-4" />
                </span>
                <span className="text-base font-medium text-foreground">{f}</span>
              </li>
            ))}
          </ul>

          <div className={`md:col-span-3 ${isVisible ? "animate-reveal-up" : "opacity-0"}`} style={{ animationDelay: "150ms" }}>
            <div className="overflow-hidden rounded-2xl border border-border bg-card card-soft">
              <div className="flex items-center gap-1.5 border-b border-border bg-muted px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-muted-foreground">app.snaplogo.in/orders</span>
              </div>
              <div className="grid grid-cols-3 gap-4 bg-gradient-to-br from-secondary/40 to-background p-6">
                <div className="col-span-1 space-y-2">
                  <div className="h-3 w-20 rounded bg-primary/30" />
                  <div className="h-2 w-16 rounded bg-border" />
                  <div className="h-2 w-14 rounded bg-border" />
                  <div className="h-2 w-12 rounded bg-border" />
                </div>
                <div className="col-span-2 space-y-3">
                  <div className="rounded-lg border border-border bg-background p-4">
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-32 rounded bg-foreground/80" />
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary">In Production</span>
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <div className="h-full w-2/3 rounded-full bg-primary" />
                    </div>
                    <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                      <span>Sample</span><span>Production</span><span>Shipping</span><span>Delivered</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <div className="h-3 w-24 rounded bg-foreground/70" />
                    <div className="mt-2 h-2 w-40 rounded bg-border" />
                    <div className="mt-1.5 h-2 w-32 rounded bg-border" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border bg-background p-3">
                      <div className="h-2 w-12 rounded bg-border" />
                      <div className="mt-2 h-4 w-16 rounded bg-primary/40" />
                    </div>
                    <div className="rounded-lg border border-border bg-background p-3">
                      <div className="h-2 w-12 rounded bg-border" />
                      <div className="mt-2 h-4 w-10 rounded bg-primary/40" />
                    </div>
                  </div>
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
