import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { IndiaNetworkMap } from "./IndiaNetworkMap";
import { networkManufacturers, networkStates } from "@/lib/manufacturer-network";

export function ManufacturerNetwork() {
  return (
    <section className="mx-auto mt-4 max-w-[820px] rounded-2xl border border-border bg-card p-4 text-left shadow-sm sm:p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-primary">Our manufacturer network</p>
          <p className="mt-1 text-base font-semibold text-foreground sm:text-lg">{networkManufacturers.length} listed businesses across {networkStates.length} states</p>
        </div>
        <Link to="/manufacturer-network" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex">View all <ArrowRight className="h-4 w-4" /></Link>
      </div>
      <IndiaNetworkMap />
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">Regional view of research listings, not factory locations or confirmed Snaplogo partners.</p>
      <Link to="/manufacturer-network" className="mt-3 flex h-10 items-center justify-center gap-1 rounded-full border border-border text-xs font-bold uppercase tracking-wide text-foreground hover:bg-muted sm:hidden">View manufacturer list <ArrowRight className="h-3.5 w-3.5" /></Link>
    </section>
  );
}
