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
              <div className="group relative aspect-video overflow-hidden rounded-2xl border border-border bg-foreground/5">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-raised shadow-lg transition-transform duration-300 group-hover:scale-110">
                    <Play className="ml-1 h-6 w-6 text-heading" />
                  </div>
                </div>
                {/* Ambient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-body-muted">Platform walkthrough · 2:40</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
