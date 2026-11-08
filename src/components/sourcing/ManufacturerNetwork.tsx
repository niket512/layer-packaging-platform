import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IndiaNetworkMap } from "./IndiaNetworkMap";
import { networkManufacturers, networkStates } from "@/lib/manufacturer-network";

export function ManufacturerNetwork() {
  return (
    <section aria-label="Manufacturer directory coverage" className="min-w-0 text-left">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Manufacturers across India.</h2>
        </div>
        <Button asChild variant="link" size="sm" className="shrink-0 px-0 text-xs"><Link to="/manufacturer-network">View list <ArrowRight className="h-4 w-4" /></Link></Button>
      </div>
      <dl className="mt-3 flex divide-x divide-border">
        {[[`${networkManufacturers.length}`, "listed businesses"], [`${networkStates.length}`, "states represented"]].map(([value, label]) => (
          <div key={label} className="flex flex-1 items-baseline gap-2 px-3 first:pl-0">
            <dd className="text-2xl font-bold text-foreground">{value}</dd>
            <dt className="text-xs text-muted-foreground">{label}</dt>
          </div>
        ))}
      </dl>
      <IndiaNetworkMap />
    </section>
  );
}
