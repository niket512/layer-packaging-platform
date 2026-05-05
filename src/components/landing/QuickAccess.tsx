import { Workflow, LayoutGrid, Sparkles, HelpCircle, ArrowUpRight } from "lucide-react";

const tiles = [
  { id: "how-it-works", label: "How it works", desc: "4 steps from spec to delivery", icon: Workflow },
  { id: "platform-film", label: "Platform preview", desc: "See the Sourcing OS in action", icon: LayoutGrid },
  { id: "capabilities", label: "Capabilities", desc: "What Snaplogo handles", icon: Sparkles },
  { id: "faq", label: "FAQ", desc: "MOQs, timelines, quality", icon: HelpCircle },
];

export default function QuickAccess() {
  return (
    <section aria-label="Quick navigation" className="border-y border-border/60 bg-muted/20 py-6">
      <div className="container">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {tiles.map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className="group flex items-start gap-3 rounded-xl border border-border bg-surface-raised p-3.5 transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-amber-subtle"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <t.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-sm font-semibold text-heading">
                  {t.label}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-0.5 text-xs text-body-muted line-clamp-1">{t.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
