import { Bookmark, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { PackagingDesign } from "./packaging-catalogue";

export function DesignCard({ design, saved, onSave, onDetails, onUse }: { design: PackagingDesign; saved: boolean; onSave: () => void; onDetails: () => void; onUse: () => void }) {
  const labels = [design.attributes.style?.[0], design.attributes.features?.[0], design.attributes.printing?.[0]].filter(Boolean);
  return <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow motion-safe:hover:shadow-md">
    <div className="relative aspect-square bg-card">
      <Button variant="ghost" aria-label={`View ${design.name}`} onClick={onDetails} className="h-full w-full rounded-none p-3">
        <img src={design.image} alt={design.name} loading="lazy" width={640} height={640} className="h-full w-full object-contain transition-transform duration-300 motion-safe:group-hover:scale-[1.02]" />
      </Button>
      <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" aria-label={`${saved ? "Remove" : "Save"} ${design.name}`} aria-pressed={saved} onClick={onSave} className={`absolute right-2 top-2 h-8 w-8 rounded-full bg-card ${saved ? "border-primary text-primary" : "text-muted-foreground"}`}><Bookmark className={saved ? "fill-current" : ""} /></Button></TooltipTrigger><TooltipContent>{saved ? "Remove from shortlist" : "Save to shortlist"}</TooltipContent></Tooltip>
    </div>
    <div className="flex flex-1 flex-col border-t border-border/60 p-3">
      <p className="text-[10px] font-medium text-muted-foreground">{design.illustrative ? "Illustrative reference" : "Catalogue reference"}</p>
      <h3 className="mt-1 text-sm font-semibold leading-snug">{design.name}</h3>
      <p className="mt-2 text-xs text-primary">{labels.join(" · ")}</p>
      <p className="mb-3 mt-2 text-xs leading-relaxed text-muted-foreground">{design.description}</p>
      <div className="mt-auto flex flex-col gap-1.5"><Button variant="link" size="sm" onClick={onDetails} className="h-8 justify-start px-0 text-xs">View details <ArrowRight /></Button><Button size="sm" onClick={onUse} className="w-full rounded-full text-xs">Use this design <ArrowRight /></Button></div>
    </div>
  </article>;
}