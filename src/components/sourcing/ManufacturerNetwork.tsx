import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
      <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[[`${networkManufacturers.length}`, "listed manufacturers"], [`${networkStates.length}`, "states covered"], ["4 hrs", "quote turnaround"], ["0%", "commission"]].map(([value, label]) => (
          <div key={label} className="rounded-xl border border-border bg-card px-3 py-2.5 text-center">
            <dt className="order-2 mt-0.5 block text-[11px] font-medium text-muted-foreground">{label}</dt>
            <dd className="order-1 block text-lg font-bold text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
      <IndiaNetworkMap />
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">Research listings, not confirmed Snaplogo partners.</p>
    </section>
  );
}
