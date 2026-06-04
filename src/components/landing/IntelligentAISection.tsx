import { useEffect, useState } from "react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import {
  Sparkles,
  Brain,
  Workflow,
  ShieldCheck,
  Users,
  FileText,
  Bell,
  ArrowRight,
  Factory,
  Building2,
  IndianRupee,
  Timer,
} from "lucide-react";
import factoryLine from "@/assets/factory-line.jpg";

const brandPoints = [
  {
    icon: Brain,
    title: "AI-based Discovery",
    desc: "Share specs, formulations, or designs — AI picks the best fit from 1,000+ manufacturers by MOQ, price, lead time, and past projects.",
  },
  {
    icon: Workflow,
    title: "End-to-End Automation",
    desc: "From matching to doorstep delivery — zero operations on your side, with real-time status at every step.",
  },
];

const manufacturerPoints = [
  {
    icon: ShieldCheck,
    title: "Quality Leads Only",
    desc: "No spam. Only verified brands with full specs and intent — your team focuses on real orders.",
  },
  {
    icon: Users,
    title: "Manage Clients in One Place",
    desc: "Conversations, samples, approvals, and orders for every client from a single dashboard.",
  },
];

const stats = [
  { icon: Factory, value: "1,000+", label: "Verified manufacturers" },
  { icon: Timer, value: "< 5 min", label: "Avg. match time" },
  { icon: IndianRupee, value: "0%", label: "Commission charged" },
  { icon: Workflow, value: "24/7", label: "AI coordination" },
];

export default function IntelligentAISection() {
  const { ref, isVisible } = useScrollReveal(0.1);

  // Cycle the AI brain "thinking" pulse
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    const t = setInterval(() => setPulse((p) => (p + 1) % 3), 1800);
    return () => clearInterval(t);
  }, [isVisible]);

  return (
    <section
      ref={ref}
      id="intelligent-ai"
      className="relative overflow-hidden bg-background py-14 md:py-20"
    >
      {/* Subtle backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[calc(50%-280px)] top-10 h-[520px] w-[520px] rounded-full bg-primary/[0.06] blur-3xl animate-ai-pulse" />
        <div className="absolute right-[-140px] bottom-0 h-[360px] w-[360px] rounded-full bg-primary/[0.04] blur-3xl animate-ai-pulse [animation-delay:1.4s]" />
      </div>

      <div className="mx-auto max-w-content px-[5vw] md:px-8">
        {/* Header */}
        <div className={`mx-auto max-w-2xl text-center ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[1.5px] text-primary">
            <Sparkles className="h-3.5 w-3.5 animate-ai-sparkle" />
            Intelligent & AI-Powered
          </span>
          <h2 className="mt-4 font-heading text-[32px] font-semibold tracking-tight text-foreground md:text-[38px]">
            One AI sitting between{" "}
            <span className="bg-gradient-to-r from-primary via-primary to-blue-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-ai-gradient">
              brands and manufacturers
            </span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Brands describe what they need. Manufacturers receive ready-to-act leads. Snaplogo's AI handles the matching, coordination, and tracking in between.
          </p>
        </div>

        {/* Centerpiece: Brand → AI → Manufacturer */}
        <div
          className={`relative mx-auto mt-12 grid max-w-5xl items-stretch gap-4 rounded-2xl border border-border bg-card p-5 card-soft md:grid-cols-[1fr_auto_1fr] md:gap-6 md:p-7 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
          style={{ animationDelay: "120ms" }}
        >
          {/* LEFT — Brand input mini-demo */}
          <div className="rounded-xl border border-border bg-muted/60 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <p className="label-eyebrow">Brand</p>
                <p className="font-heading text-sm font-semibold text-foreground">Describes the need</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {[
                { label: "Product", value: "Cold-pressed juice" },
                { label: "Packaging", value: "Stand-up pouch · 250 ml" },
                { label: "Quantity", value: "5,000 units" },
                { label: "Timeline", value: "Ship in 3 weeks" },
              ].map((row, i) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-xs ${
                    isVisible ? "animate-reveal-up" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${260 + i * 90}ms`, animationFillMode: "both" }}
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium text-foreground">{row.value}</span>
                </div>
              ))}

              <div
                className={`flex items-center gap-2 rounded-lg border border-dashed border-primary/40 bg-secondary px-3 py-2 text-xs text-primary ${
                  isVisible ? "animate-reveal-up" : "opacity-0"
                }`}
                style={{ animationDelay: "620ms", animationFillMode: "both" }}
              >
                <FileText className="h-3.5 w-3.5" />
                <span className="font-semibold">design-spec.pdf</span>
                <span className="text-primary/70">attached</span>
              </div>
            </div>
          </div>

          {/* MIDDLE — AI brain */}
          <div className="relative flex items-center justify-center py-6 md:py-0">
            {/* Connecting lines (desktop) */}
            <div className="pointer-events-none absolute inset-y-0 left-[-24px] right-[-24px] hidden items-center md:flex">
              <div className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-border">
                <div className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent animate-beam-right" />
              </div>
              <div className="w-[88px]" />
              <div className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent animate-beam-right"
                  style={{ animationDelay: "1.2s" }}
                />
              </div>
            </div>

            {/* Connecting lines (mobile) */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex h-full flex-col items-center md:hidden">
              <div className="relative w-[2px] flex-1 overflow-hidden rounded-full bg-border">
                <div className="absolute inset-x-0 -top-1/3 h-1/3 bg-gradient-to-b from-transparent via-primary to-transparent animate-beam-down" />
              </div>
              <div className="h-[88px]" />
              <div className="relative w-[2px] flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className="absolute inset-x-0 -top-1/3 h-1/3 bg-gradient-to-b from-transparent via-primary to-transparent animate-beam-down"
                  style={{ animationDelay: "1.2s" }}
                />
              </div>
            </div>

            {/* Brain orb */}
            <div className="relative">
              <div className="absolute inset-0 -m-3 animate-ai-pulse rounded-full bg-primary/20 blur-xl" />
              <div className="relative flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-500 text-primary-foreground shadow-[0_12px_36px_-12px_hsl(var(--primary)/0.7)]">
                <Brain className="h-7 w-7" />
                <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[1.5px]">Snap AI</span>
              </div>
              {/* Thinking dots */}
              <div className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 gap-1">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      pulse === d ? "bg-primary" : "bg-border"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Manufacturer lead mini-demo */}
          <div className="rounded-xl border border-border bg-muted/60 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Factory className="h-4 w-4" />
              </div>
              <div>
                <p className="label-eyebrow">Manufacturer</p>
                <p className="font-heading text-sm font-semibold text-foreground">Gets a qualified lead</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {/* Notification card */}
              <div
                className={`rounded-lg border border-primary/30 bg-background p-3 ${
                  isVisible ? "animate-reveal-up" : "opacity-0"
                }`}
                style={{ animationDelay: "700ms", animationFillMode: "both" }}
              >
                <div className="flex items-start gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                    <Bell className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground">New verified lead</p>
                      <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-primary">
                        98% fit
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Cold-pressed juice brand · 5,000 stand-up pouches · 3-week timeline
                    </p>
                  </div>
                </div>
              </div>

              {/* Lead details */}
              {[
                { label: "Brand", value: "Verified ·  GST + 2 SKUs live" },
                { label: "Budget", value: "₹4–5 / pouch" },
                { label: "Decision", value: "Brief approved, ready to sample" },
              ].map((row, i) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-[11px] ${
                    isVisible ? "animate-reveal-up" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${820 + i * 90}ms`, animationFillMode: "both" }}
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium text-foreground">{row.value}</span>
                </div>
              ))}

              <button
                type="button"
                className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-[#1D4ED8]"
              >
                Accept & quote <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Two-column: For Brands / For Manufacturers */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* For Brands */}
          <div
            className={`group relative rounded-2xl border border-border bg-card p-7 card-soft transition-all hover:-translate-y-1 hover:border-primary/40 ${
              isVisible ? "animate-reveal-up" : "opacity-0"
            }`}
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.6)]">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="label-eyebrow">For Brands</p>
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  AI that sources for you
                </h3>
              </div>
            </div>

            <ul className="mt-6 space-y-5">
              {brandPoints.map((p, i) => (
                <li
                  key={p.title}
                  className={`flex gap-4 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
                  style={{ animationDelay: `${320 + i * 100}ms` }}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary transition-transform group-hover:scale-110">
                    <p.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-heading text-base font-semibold text-foreground">{p.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* For Manufacturers */}
          <div
            className={`group relative rounded-2xl border border-border bg-card p-7 card-soft transition-all hover:-translate-y-1 hover:border-primary/40 ${
              isVisible ? "animate-reveal-up" : "opacity-0"
            }`}
            style={{ animationDelay: "280ms" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.6)]">
                <Factory className="h-5 w-5" />
              </div>
              <div>
                <p className="label-eyebrow">For Manufacturers</p>
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  Only the leads worth your time
                </h3>
              </div>
            </div>

            <ul className="mt-6 space-y-5">
              {manufacturerPoints.map((p, i) => (
                <li
                  key={p.title}
                  className={`flex gap-4 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
                  style={{ animationDelay: `${400 + i * 100}ms` }}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary transition-transform group-hover:scale-110">
                    <p.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-heading text-base font-semibold text-foreground">{p.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Stats strip */}
        <div
          className={`mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border/60 md:grid-cols-4 ${
            isVisible ? "animate-reveal-up" : "opacity-0"
          }`}
          style={{ animationDelay: "460ms" }}
        >
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3 bg-card p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <s.icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="font-heading text-xl font-bold tracking-tight text-foreground">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Verified network photo */}
        <div
          className={`mt-8 overflow-hidden rounded-2xl border border-border card-soft ${
            isVisible ? "animate-reveal-up" : "opacity-0"
          }`}
          style={{ animationDelay: "540ms" }}
        >
          <div className="relative">
            <img
              src={factoryLine}
              alt="Verified packaging manufacturing line"
              loading="lazy"
              width={1280}
              height={896}
              className="h-[220px] w-full object-cover transition-transform duration-[1200ms] hover:scale-[1.03] md:h-[300px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="label-eyebrow">Verified Network</p>
                <p className="mt-1 font-heading text-lg font-semibold text-foreground">
                  1,000+ manufacturers. Every one vetted.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background/90 px-3 py-1 text-[11px] font-semibold text-primary backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5" />
                Quality-checked
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
