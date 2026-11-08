import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { networkManufacturers, networkStates } from "@/lib/manufacturer-network";

export function IndiaNetworkMap() {
  const [state, setState] = useState("");
  const key = import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY'];
  const channel = import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID'];
  const authorizedOrigin = /(^|\.)(lovable\.app|lovableproject\.com)$/.test(window.location.hostname);
  const canLoadMap = !!key && authorizedOrigin;
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key ?? "")}&q=${encodeURIComponent(state ? `${state}, India` : "India")}&zoom=${state ? 6 : 4}&maptype=roadmap&language=en${channel ? `&channel=${encodeURIComponent(channel)}` : ""}`;
  const count = state ? networkManufacturers.filter(entry => entry.state === state).length : networkManufacturers.length;
  const listUrl = `/manufacturer-network${state ? `?state=${encodeURIComponent(state)}` : ""}`;

  return <div className="mt-4 grid overflow-hidden rounded-lg border border-border sm:grid-cols-[1fr_220px]">
    <div className="relative h-[320px] bg-muted sm:h-[380px]">
      {canLoadMap ? <iframe title={state ? `Manufacturer region: ${state}, India` : "Manufacturer regions across India"} src={mapUrl} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" className="h-full w-full border-0" allowFullScreen />
        : <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center"><MapPin className="h-8 w-8 text-primary" /><p className="font-semibold">{state || "India"}</p><p className="max-w-xs text-xs leading-relaxed text-muted-foreground">The interactive map is available in the Lovable preview. The manufacturer list is available here.</p><Button asChild variant="outline" size="sm" className="rounded-full"><Link to={listUrl}>View {count} listings <ArrowRight /></Link></Button></div>}
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