import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Play, Search, Users, MessageSquare, CreditCard, Truck } from "lucide-react";

const workflowSteps = [
  { icon: Search, label: "Search with text + image" },
  { icon: Users, label: "Find reliable manufacturers" },
  { icon: MessageSquare, label: "Contact & align" },
  { icon: CreditCard, label: "Track payment" },
  { icon: Truck, label: "Track shipment" },
];

export default function PlatformFilmSection() {
  const { ref, isVisible } = useScrollReveal();

  const thread = [
    {
      sender: "Brand team",
      role: "Buyer",
      message: "Need a rigid gift box with deep amber foil, 1,500 units for a festive skincare launch.",
      meta: "09:12",
      align: "left",
    },
    {
      sender: "Layer",
      role: "Ops",
      message: "Matched with 3 verified manufacturers. Lowest viable MOQ is 1,200 units with 11-day sampling.",
      meta: "09:14",
      align: "right",
    },
    {
      sender: "Print partner",
      role: "Manufacturer",
      message: "Foil swatch and board sample uploaded. Awaiting approval to lock production slot.",
      meta: "09:18",
      align: "left",
    },
  ] as const;

  const milestones = [
    { label: "Sample approval", value: "Pending sign-off" },
    { label: "Payment", value: "Advance due after QC" },
    { label: "Shipment", value: "ETA 6 days after run" },
  ] as const;

  return (
    <section ref={ref} id="platform-film" className="bg-muted/40 py-24 md:py-32">
      <div className="container">
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Platform film</p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-heading text-balance sm:text-4xl">
            See the full packaging workflow
          </h2>
          <p className="mt-4 text-body">
            From the first search to final delivery — watch how Layer orchestrates every step.
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
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-body-muted transition-colors hover:bg-surface-raised hover:text-heading"
                >
                  <s.icon className="h-4 w-4 shrink-0 text-primary/70" />
                  <span>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Video placeholder */}
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
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Conversation rail</p>
                        <h3 className="mt-1 font-heading text-xl font-bold tracking-tight text-heading">
                          Packaging execution thread
                        </h3>
                      </div>
                      <div className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-body-muted">
                        Live coordination
                      </div>
                    </div>

                    <div className="mt-5 space-y-4">
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
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-heading">Reference + spec attached</p>
                          <p className="mt-1 text-xs text-body-muted">250gsm rigid board · soft-touch lamination · amber foil</p>
                        </div>
                        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background transition-transform duration-300 group-hover:scale-110">
                          <Play className="ml-0.5 h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/40 p-5 sm:p-6">
                    <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Execution status</p>
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
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Film cue</p>
                          <p className="mt-1 text-sm font-semibold text-heading">Platform walkthrough · 2:40</p>
                        </div>
                        <div className="rounded-full bg-amber-subtle px-3 py-1 text-[11px] font-medium text-heading">
                          Ops view
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {workflowSteps.map((s) => (
                          <div
                            key={s.label}
                            className="flex items-center gap-3 rounded-xl border border-border/70 bg-background px-3 py-2.5"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-subtle text-primary">
                              <s.icon className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium text-heading">{s.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/40 to-transparent" />
                <div className="pointer-events-none absolute right-5 top-5 rounded-full border border-border bg-background/90 px-3 py-1 text-[11px] font-medium text-body-muted backdrop-blur-sm">
                  Video-first preview
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
