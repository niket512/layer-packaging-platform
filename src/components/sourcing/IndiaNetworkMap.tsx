import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listingDensity, networkManufacturers } from "@/lib/manufacturer-network";
import statePaths from "@/data/india-state-paths.json";

export function IndiaNetworkMap() {
  const [state, setState] = useState("");
  const listUrl = `/manufacturer-network${state ? `?state=${encodeURIComponent(state)}` : ""}`;

  return <div className="mt-2 overflow-hidden rounded-lg border border-border">
    <div className="relative h-[240px] bg-muted/40 p-2 sm:h-[280px]">
      <svg viewBox="0 0 440 450" className="h-full w-full" aria-label="India manufacturer network by state">
        {statePaths.map(region => {
          const listings = networkManufacturers.filter(entry => entry.state === region.name).length;
          return <path key={region.name} d={region.path} fillRule="evenodd" role={listings ? "button" : undefined} tabIndex={listings ? 0 : undefined} aria-label={`${region.name}: ${listings} listings`} aria-pressed={listings ? state === region.name : undefined}
            onClick={() => { if (listings) setState(region.name); }}
            onKeyDown={event => { if (listings && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); setState(region.name); } }}
            className={`network-density-${listingDensity(listings)} transition-opacity ${state === region.name ? "stroke-foreground stroke-[2]" : "stroke-background stroke-[1.2]"} ${listings ? "cursor-pointer hover:opacity-80 focus:stroke-foreground focus:stroke-[2] focus:outline-none" : ""}`}>
            <title>{region.name} · {listings ? "Manufacturer references available" : "No listed references"}</title>
          </path>;
        })}
      </svg>
      <div className="absolute bottom-3 left-3 flex flex-col gap-1 rounded-md border border-border bg-background/95 px-3 py-2"><p className="text-[10px] font-medium text-muted-foreground">Listing density</p><div className="flex items-center gap-1.5"><span className="text-[10px] text-muted-foreground">Lower</span><div className="flex gap-0.5" aria-label="Light orange to dark orange represents increasing listing density">{["low", "medium", "high", "highest"].map(level => <span key={level} className={`network-density-swatch-${level} h-2.5 w-5 rounded-sm`} />)}</div><span className="text-[10px] text-muted-foreground">Higher</span></div></div>
    </div>
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{state || "Across India"}</h3>{state && <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setState("")}>All India</Button>}</div>
      <Button asChild size="sm" className="rounded-full text-xs"><Link to={listUrl}>View manufacturers <ArrowRight /></Link></Button>
    </div>
  </div>;
}