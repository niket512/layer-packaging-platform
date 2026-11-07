import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";

// Experimental sample network counts (user-approved for trust testing; not verified figures).
const HUBS = [
  { city: "Ahmedabad", count: 18, tags: "Boxes · Pouches" },
  { city: "Mumbai", count: 16, tags: "Pouches · Labels" },
  { city: "Delhi NCR", count: 15, tags: "Boxes · Rigid" },
  { city: "Surat", count: 11, tags: "Corrugated" },
  { city: "Pune", count: 10, tags: "Pouches · Sachets" },
  { city: "Bengaluru", count: 9, tags: "Mono-cartons" },
  { city: "Chennai", count: 8, tags: "Corrugated" },
  { city: "Jaipur", count: 7, tags: "Kraft · Eco" },
  { city: "Kolkata", count: 6, tags: "Boxes" },
];

export function ManufacturerNetwork() {
  const total = HUBS.reduce((n, h) => n + h.count, 0);
  return (
    <section className="mx-auto mt-4 max-w-[820px] rounded-2xl border border-border bg-card p-4 text-left shadow-sm sm:p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-primary">Our manufacturer network</p>
          <p className="mt-1 text-base font-semibold text-foreground sm:text-lg">{total}+ vetted makers across {HUBS.length} hubs in India</p>
        </div>
        <Link to="/manufacturers" className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex">View all <ArrowRight className="h-4 w-4" /></Link>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {HUBS.map((h) => (
          <li key={h.city} className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-foreground">{h.city} <span className="font-normal text-muted-foreground">· {h.count}</span></p>
              <p className="truncate text-[11px] text-muted-foreground">{h.tags}</p>
            </div>
          </li>
        ))}
      </ul>
      <Link to="/manufacturers" className="mt-3 flex h-10 items-center justify-center gap-1 rounded-full border border-border text-xs font-bold uppercase tracking-wide text-foreground hover:bg-muted sm:hidden">View manufacturer list <ArrowRight className="h-3.5 w-3.5" /></Link>
    </section>
  );
}
