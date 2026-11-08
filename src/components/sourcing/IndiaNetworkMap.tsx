import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { networkManufacturers, networkStates } from "@/lib/manufacturer-network";
import statePaths from "@/data/india-state-paths.json";

export function IndiaNetworkMap() {
  const [state, setState] = useState("");
  const count = state ? networkManufacturers.filter(entry => entry.state === state).length : networkManufacturers.length;
  const listUrl = `/manufacturer-network${state ? `?state=${encodeURIComponent(state)}` : ""}`;

  return <div className="mt-4 grid overflow-hidden rounded-lg border border-border sm:grid-cols-[1fr_220px]">
    <div className="relative h-[360px] bg-muted/40 p-3 sm:h-[420px]">
      <svg viewBox="0 0 440 450" className="h-full w-full" aria-label="India manufacturer network by state">
        {statePaths.map(region => {
          const listings = networkManufacturers.filter(entry => entry.state === region.name).length;
          return <path key={region.name} d={region.path} fillRule="evenodd" role={listings ? "button" : undefined} tabIndex={listings ? 0 : undefined} aria-label={`${region.name}: ${listings} listings`} aria-pressed={listings ? state === region.name : undefined}
            onClick={() => { if (listings) setState(region.name); }}
            onKeyDown={event => { if (listings && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); setState(region.name); } }}
            className={`stroke-background stroke-[1.2] transition-colors ${state === region.name ? "fill-primary" : listings ? "cursor-pointer fill-primary/30 hover:fill-primary/60 focus:fill-primary/60 focus:outline-none" : "fill-border"}`}>
            <title>{region.name} · {listings} listings</title>
          </path>;
        })}
      </svg>
      <div className="absolute bottom-3 left-3 rounded-md border border-border bg-background/95 px-3 py-2"><p className="text-xs font-semibold">{state || "Across India"}</p><p className="text-xs text-muted-foreground">{count} manufacturer listings</p></div>
      <a href="https://github.com/udit-001/india-maps-data" target="_blank" rel="noopener noreferrer" className="absolute bottom-3 right-3 text-[10px] text-muted-foreground underline">Map boundaries</a>
    </div>
    <div className="flex min-w-0 flex-col border-t border-border bg-card p-4 sm:border-l sm:border-t-0">
      <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">Explore by state</h3>{state && <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setState("")}>All India</Button>}</div>
      <div className="mt-3 grid max-h-[180px] grid-cols-2 gap-1 overflow-y-auto sm:max-h-[255px] sm:grid-cols-1" aria-label="Manufacturer states">
        {networkStates.map(value => <Button key={value} variant={state === value ? "secondary" : "ghost"} aria-pressed={state === value} onClick={() => setState(value)} className="h-8 justify-between gap-2 rounded-md px-2 text-xs"><span className="truncate">{value}</span><span className="text-muted-foreground">{networkManufacturers.filter(entry => entry.state === value).length}</span></Button>)}
      </div>
      <Button asChild size="sm" className="mt-4 w-full rounded-full text-xs"><Link to={listUrl}>View {count} listings <ArrowRight /></Link></Button>
    </div>
  </div>;
}