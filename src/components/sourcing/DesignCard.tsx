import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PackagingDesign } from "./packaging-catalogue";

export function DesignCard({ design, onDetails, onUse }: { design: PackagingDesign; onDetails: () => void; onUse: () => void }) {
  const labels = [design.attributes.style?.[0], design.attributes.features?.[0], design.attributes.printing?.[0]].filter(Boolean);
  return <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md">
    <div className="relative aspect-square bg-muted/40">
      <Button variant="ghost" aria-label={`View ${design.name}`} onClick={onDetails} className="h-full w-full rounded-none p-2 sm:p-3">
        <img src={design.image} alt={design.name} loading="lazy" width={640} height={640} className="h-full w-full object-contain transition-transform duration-300 motion-safe:group-hover:scale-[1.02]" />
      </Button>
    </div>
    <div className="flex flex-1 flex-col border-t border-border/60 p-2.5 sm:p-3">
      <p className="text-[10px] font-medium text-muted-foreground">{design.illustrative ? "Illustrative" : "Catalogue"}</p>
      <h3 className="mt-1 text-sm font-semibold leading-snug">{design.name}</h3>
      <p className="mb-2 mt-1 line-clamp-1 text-[11px] text-primary sm:mb-0 sm:mt-2 sm:text-xs">{labels.join(" · ")}</p>
      <p className="mb-3 mt-2 hidden text-xs leading-relaxed sm:block text-muted-foreground">{design.description}</p>
      <div className="mt-auto flex items-center justify-between gap-2"><Button variant="link" size="sm" onClick={onDetails} className="hidden h-8 px-0 text-xs sm:inline-flex">View details <ArrowRight /></Button><Button size="sm" onClick={onUse} className="h-9 w-full rounded-full px-3 text-xs font-semibold sm:w-auto">Select <ArrowRight /></Button></div>
    </div>
  </article>;
}
