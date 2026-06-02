import { useState } from "react";
import { ArrowUpRight, Plus, Minus } from "lucide-react";

const openForm = () => {
  document.getElementById("sign-up")?.scrollIntoView({ behavior: "smooth" });
  window.dispatchEvent(new CustomEvent("open-access-form"));
};

const features = [
  {
    title: "Browse 500+ Verified Manufacturers",
    body: "Filter Snaplogo's vetted network of Indian contract manufacturers by category, certifications, MOQ, and lead time — find exactly who fits your brand.",
  },
  {
    title: "Get Matched Instantly",
    body: "Share your brief once. We surface manufacturers suited to your product, quantity, and timeline — no cold outreach, no follow-ups.",
  },
  {
    title: "Manage Orders End-to-End",
    body: "Approve samples, lock pricing, and track production from a single dashboard. Snaplogo coordinates with the manufacturer on your behalf.",
  },
  {
    title: "Track Shipments & Payments",
    body: "Real-time updates on production milestones, dispatch, and delivery — with transparent invoicing and secure payments handled in one place.",
  },
];

export default function HeroSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div className="mx-auto grid max-w-content grid-cols-1 gap-12 px-[5vw] pt-16 pb-20 md:grid-cols-2 md:gap-10 md:px-8 md:pt-24 md:pb-24 lg:gap-16">
        {/* LEFT */}
        <div className="flex flex-col">
          <h1 className="font-heading text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-[56px]">
            Find your next manufacturer.
          </h1>
          <p className="mt-6 max-w-[520px] text-base leading-relaxed text-muted-foreground md:text-[17px]">
            Browse Snaplogo's network of 500+ verified Indian contract manufacturers. Filter by category, certifications, and capabilities to find exactly who you need.
          </p>

          <div className="mt-8">
            <button
              onClick={openForm}
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[13px] font-bold uppercase tracking-wider text-primary-foreground shadow-[0_4px_20px_rgba(37,99,235,0.25)] transition-all hover:bg-primary/90 hover:shadow-[0_6px_24px_rgba(37,99,235,0.35)]"
            >
              Get Started
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="mt-12 border-t border-border">
            {features.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={f.title} className="border-b border-border">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="font-heading text-lg font-semibold text-foreground md:text-xl">
                      {f.title}
                    </span>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center text-muted-foreground">
                      {isOpen ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-[480px] text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                        {f.body}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT — Dashboard preview */}
        <div className="relative md:pl-4">
          <div className="absolute -inset-8 -z-10 rounded-[40px] bg-gradient-to-br from-secondary/60 via-background to-background" />
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_60px_-20px_rgba(15,23,42,0.18)]">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 border-b border-border bg-muted px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="ml-3 text-xs text-muted-foreground">app.snaplogo.in/manufacturers</span>
            </div>

            {/* App header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <span className="font-heading text-sm font-bold tracking-tight text-foreground">snaplogo</span>
              <div className="hidden flex-1 px-6 sm:block">
                <div className="flex h-8 items-center rounded-full border border-border bg-background px-3 text-[11px] text-muted-foreground">
                  Search by product, category, or manufacturer
                </div>
              </div>
              <span className="rounded-md border border-border px-2 py-1 text-[10px] font-semibold text-foreground">+ Invite</span>
            </div>

            <div className="grid grid-cols-12 gap-3 bg-muted/30 p-4">
              {/* Filters */}
              <div className="col-span-4 space-y-3">
                <p className="text-[10px] font-semibold text-foreground">152 pouch manufacturers</p>
                <div className="space-y-2 rounded-lg border border-border bg-background p-3">
                  <p className="text-[10px] font-semibold text-foreground">Category</p>
                  {["Stand-up Pouches", "Sachets", "Spouted"].map((c, i) => (
                    <div key={c} className="flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1.5 text-foreground">
                        <span className={`h-3 w-3 rounded-sm ${i < 2 ? "bg-primary" : "border border-border"}`} />
                        {c}
                      </span>
                      <span className="text-muted-foreground">{[124, 86, 42][i]}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 rounded-lg border border-border bg-background p-3">
                  <p className="text-[10px] font-semibold text-foreground">Certifications</p>
                  {["FSSAI", "ISO 9001", "BRC"].map((c, i) => (
                    <div key={c} className="flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1.5 text-foreground">
                        <span className={`h-3 w-3 rounded-sm ${i < 2 ? "bg-primary" : "border border-border"}`} />
                        {c}
                      </span>
                      <span className="text-muted-foreground">{[98, 64, 32][i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cards */}
              <div className="col-span-8 space-y-3">
                {[
                  { name: "Shree Packaging Co.", loc: "Ahmedabad, GJ", tag: "Preferred" },
                  { name: "Veloflex Industries", loc: "Pune, MH", tag: "Preferred" },
                  { name: "Pacworth Pvt Ltd", loc: "Bengaluru, KA", tag: "Verified" },
                ].map((m, i) => (
                  <div key={i} className="overflow-hidden rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between bg-gradient-to-r from-secondary to-secondary/40 px-3 py-1.5">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-primary">{m.tag}</span>
                      <span className="text-[9px] font-semibold text-muted-foreground">Manufacturer</span>
                    </div>
                    <div className="flex items-center gap-3 p-3">
                      <div className="h-9 w-9 shrink-0 rounded-md bg-secondary" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[11px] font-semibold text-foreground">{m.name}</p>
                        <p className="text-[9px] text-muted-foreground">{m.loc} · Accepting Projects</p>
                      </div>
                      <span className="rounded-md bg-primary px-2 py-1 text-[9px] font-semibold text-primary-foreground">
                        Request Quote
                      </span>
                    </div>
                    <div className="flex items-center gap-3 border-t border-border px-3 py-1.5 text-[9px] text-muted-foreground">
                      <span className="text-emerald-600">✓ Pouches</span>
                      <span>+{[12, 18, 9][i]} other</span>
                      <span>{[16, 21, 14][i]} Capabilities</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
