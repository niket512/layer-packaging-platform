import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Sparkles, Search, BadgeCheck, MessageSquare, CreditCard, Truck, Paperclip, ArrowUpRight, Factory } from "lucide-react";

const workflowSteps = [
  { icon: Search, label: "Prompt with text + image" },
  { icon: BadgeCheck, label: "Verified manufacturers only" },
  { icon: MessageSquare, label: "Align specs in one thread" },
  { icon: CreditCard, label: "Track quotes + payment" },
  { icon: Truck, label: "Track production + shipment" },
];

export default function PlatformFilmSection() {
  const { ref, isVisible } = useScrollReveal();

  const thread = [
    {
      sender: "You",
      role: "D2C brand",
      message: "Source a rigid gift box for a premium skincare launch. Need deep amber foil, strong shelf presence, and 1,500 units to start.",
      meta: "09:12",
      align: "left",
    },
    {
      sender: "Layer AI",
      role: "Smart sourcing",
      message: "Matched your brief with 3 verified manufacturers across rigid boxes. Best fit hits your finish, lowers MOQ to 1,200, and can deliver samples in 11 days.",
      meta: "09:14",
      align: "right",
    },
    {
      sender: "Layer AI",
      role: "Recommendation",
      message: "Recommended next step: approve foil swatch, lock board thickness, and open quote comparison before production slot expires tomorrow.",
      meta: "09:18",
      align: "right",
    },
  ] as const;

  const milestones = [
    { label: "Verified matches", value: "3 shortlisted" },
    { label: "Lowest MOQ", value: "1,200 units" },
    { label: "Sampling window", value: "11 working days" },
  ] as const;

  const manufacturers = [
    { name: "Pune Rigid Works", meta: "Rigid boxes · Pune", stat: "MOQ 1,200", note: "Foil + soft-touch specialist" },
    { name: "Noida Print Collective", meta: "Cartons · Noida", stat: "Sample in 9 days", note: "Strong cosmetic finishing QA" },
    { name: "Ahmedabad Pack Studio", meta: "Premium packaging · Ahmedabad", stat: "98.2% QC pass", note: "Best for repeat seasonal runs" },
  ] as const;

  return (
    <section ref={ref} id="platform-film" className="bg-muted/40 py-24 md:py-32">
      <div className="container">
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Platform film</p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-heading text-balance sm:text-4xl">
            Cursor for D2C packaging teams
          </h2>
          <p className="mt-4 text-body">
            Smart sourcing with AI — from your first prompt to verified manufacturer selection, approvals, and shipment tracking.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-5xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            {/* Workflow rail */}
            <div
              className={`shrink-0 space-y-1 md:w-52 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
              style={{ animationDelay: "200ms" }}
            >
              {workflowSteps.map((s, i) => (
                <div
                  key={s.label}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    i === 0 ? "bg-surface-raised text-heading shadow-sm" : "text-body-muted hover:bg-surface-raised hover:text-heading"
                  }`}
                >
                  <s.icon className="h-4 w-4 shrink-0 text-primary/70" />
                  <span>{s.label}</span>
                </div>
              ))}
            </div>

            {/* AI workspace */}
            <div
              className={`flex-1 ${isVisible ? "animate-reveal-scale" : "opacity-0"}`}
              style={{ animationDelay: "300ms" }}
            >
              <div className="group relative overflow-hidden rounded-[1.75rem] border border-border bg-surface-raised shadow-2xl shadow-primary/5">
                <div className="absolute inset-x-0 top-0 h-24 bg-muted/60" />
                <div className="relative grid min-h-[29rem] gap-0 lg:grid-cols-[1.4fr_0.92fr]">
                  <div className="relative border-b border-border/70 p-5 sm:p-6 lg:border-b-0 lg:border-r">
                    <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">AI sourcing workspace</p>
                        <h3 className="mt-1 font-heading text-xl font-bold tracking-tight text-heading">
                          Source packaging like your team uses Cursor
                        </h3>
                      </div>
                      <div className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-body-muted">
                        Verified-only mode
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-border/70 bg-background p-4 shadow-sm">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-body-muted">
                        <span className="rounded-full bg-muted px-2.5 py-1">Beauty</span>
                        <span className="rounded-full bg-muted px-2.5 py-1">Rigid box</span>
                        <span className="rounded-full bg-muted px-2.5 py-1">Amber foil</span>
                        <span className="rounded-full bg-muted px-2.5 py-1">India only</span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-4">
                      {thread.map((item, index) => (
                        <div
                          key={`${item.sender}-${index}`}
                          className={`flex ${item.align === "right" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[88%] rounded-2xl border px-4 py-3 shadow-sm ${
                              item.align === "right"
                                ? "border-primary/20 bg-amber-subtle"
                                : "border-border bg-background"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold text-heading">{item.sender}</p>
                                <p className="text-[11px] uppercase tracking-[0.16em] text-body-muted">{item.role}</p>
                              </div>
                              <span className="text-[11px] font-medium text-body-muted">{item.meta}</span>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-body">{item.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/50 p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
                            <Paperclip className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-heading">Prompt, reference image, and specs attached</p>
                            <p className="mt-1 text-xs text-body-muted">250gsm rigid board · soft-touch lamination · deep amber foil · target MOQ 1,500</p>
                          </div>
                        </div>
                        <button className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform duration-300 group-hover:scale-[1.03] active:scale-[0.98]">
                          <Sparkles className="h-4 w-4" />
                          Run sourcing
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/40 p-5 sm:p-6">
                    <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Match summary</p>
                      <div className="mt-4 space-y-3">
                        {milestones.map((item) => (
                          <div key={item.label} className="rounded-xl border border-border/70 bg-surface-raised p-3">
                            <p className="text-xs font-medium uppercase tracking-[0.14em] text-body-muted">{item.label}</p>
                            <p className="mt-1 text-sm font-semibold text-heading">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-border bg-surface-raised p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Verified manufacturers</p>
                          <p className="mt-1 text-sm font-semibold text-heading">Only factories Layer has vetted</p>
                        </div>
                        <div className="rounded-full bg-amber-subtle px-3 py-1 text-[11px] font-medium text-heading">
                          India network
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {manufacturers.map((item) => (
                          <div
                            key={item.name}
                            className="rounded-xl border border-border/70 bg-background p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-subtle text-primary">
                                  <Factory className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-heading">{item.name}</p>
                                  <p className="mt-0.5 text-xs text-body-muted">{item.meta}</p>
                                </div>
                              </div>
                              <ArrowUpRight className="mt-1 h-4 w-4 text-body-muted" />
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-3">
                              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-heading">
                                {item.stat}
                              </span>
                              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
                                Verified
                              </span>
                            </div>

                            <p className="mt-2 text-xs leading-relaxed text-body">{item.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/40 to-transparent" />
                <div className="pointer-events-none absolute right-5 top-5 rounded-full border border-border bg-background/90 px-3 py-1 text-[11px] font-medium text-body-muted backdrop-blur-sm">
                  AI-first preview
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
