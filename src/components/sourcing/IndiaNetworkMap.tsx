import { Button } from "@/components/ui/button";
import { listingDensity, networkManufacturers } from "@/lib/manufacturer-network";
import statePaths from "@/data/india-state-paths.json";

export function IndiaNetworkMap({ state, onStateChange }: { state: string; onStateChange: (state: string) => void }) {

  return <div className="mt-2 overflow-hidden rounded-lg border border-border">
    <div className="relative h-[240px] bg-muted/40 p-2 sm:h-[280px]">
      <svg viewBox="0 0 440 450" className="h-full w-full" aria-label="India manufacturer network by state">
        {statePaths.map(region => {
          const listings = networkManufacturers.filter(entry => entry.state === region.name).length;
          return <path key={region.name} d={region.path} fillRule="evenodd" role={listings ? "button" : undefined} tabIndex={listings ? 0 : undefined} aria-label={`${region.name}: ${listings} listings`} aria-pressed={listings ? state === region.name : undefined}
            onClick={() => { if (listings) onStateChange(region.name); }}
            onKeyDown={event => { if (listings && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onStateChange(region.name); } }}
            className={`network-density-${listingDensity(listings)} transition-opacity ${state === region.name ? "stroke-foreground stroke-[2]" : "stroke-background stroke-[1.2]"} ${listings ? "cursor-pointer hover:opacity-80 focus:stroke-foreground focus:stroke-[2] focus:outline-none" : ""}`}>
            <title>{region.name} · {listings ? "Manufacturer references available" : "No listed references"}</title>
          </path>;
        })}
      </svg>
    </div>
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{state || "Across India"}</h3>{state && <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onStateChange("")}>All India</Button>}</div>
    </div>
  </div>;
}