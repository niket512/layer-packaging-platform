import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Map } from "lucide-react";
import { IndiaNetworkMap } from "./IndiaNetworkMap";
import { networkManufacturers, networkStates } from "@/lib/manufacturer-network";

export function ManufacturerNetwork() {
  return (
    <section className="mx-auto mt-4 max-w-[820px] border-y border-border py-3 text-left">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-primary">Our manufacturer network</p>
          <p className="mt-1 text-base font-semibold text-foreground sm:text-lg">{networkManufacturers.length} listed businesses across {networkStates.length} states</p>
        </div>
        <Link to="/manufacturer-network" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline">View list <ArrowRight className="h-4 w-4" /></Link>
      </div>
      <details className="group mt-2">
        <summary className="flex cursor-pointer list-none items-center gap-2 py-1 text-xs font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden"><Map className="h-4 w-4" />Explore India map<ChevronDown className="ml-auto h-4 w-4 transition-transform group-open:rotate-180" /></summary>
        <IndiaNetworkMap />
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">Regional view of research listings, not factory locations or confirmed Snaplogo partners.</p>
      </details>
    </section>
  );
}
