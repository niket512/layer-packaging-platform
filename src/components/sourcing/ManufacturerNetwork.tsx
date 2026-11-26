import { IndiaNetworkMap } from "./IndiaNetworkMap";
import { networkManufacturers } from "@/lib/manufacturer-network";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ManufacturerNetwork() {
  const [state, setState] = useState("");
  const listUrl = `/manufacturer-network${state ? `?state=${encodeURIComponent(state)}` : ""}`;
  return (
    <section aria-label="Manufacturer directory coverage" className="min-w-0 text-left">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Manufacturers across India.</h2>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <dl className="flex items-baseline gap-2">
          <dt className="order-2 text-xs text-muted-foreground">listed manufacturers</dt>
          <dd className="order-1 text-2xl font-bold text-foreground">{networkManufacturers.length}</dd>
        </dl>
        <Button asChild size="sm" className="shrink-0 rounded-full text-xs"><Link to={listUrl}>View manufacturers <ArrowRight /></Link></Button>
      </div>
      <IndiaNetworkMap state={state} onStateChange={setState} />
    </section>
  );
}
