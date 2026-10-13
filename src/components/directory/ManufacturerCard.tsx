import { Link } from "react-router-dom";
import { Check, MapPin, Plus, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type DirectoryManufacturer, categoryLabel, placeOf, waDigits, whatsappHref } from "@/data/directory";

interface Props {
  m: DirectoryManufacturer;
  selected?: boolean;
  onToggleSelect?: () => void;
  waText?: string;
}

export function ManufacturerCard({ m, selected = false, onToggleSelect, waText }: Props) {
  const moq = m.minimum_order_quantities[0];
  const lead = m.lead_times[0];
  const canSelect = !!onToggleSelect && !!m.phone;
  const waHref = m.phone ? (waText ? `https://wa.me/${waDigits(m.phone)}?text=${encodeURIComponent(waText)}` : whatsappHref(m.name, m.phone)) : undefined;
  return (
    <article
      className={`relative grid grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-lg border p-4 transition-colors sm:grid-cols-[100px_minmax(0,1fr)] sm:gap-5 ${selected ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-border bg-card hover:border-muted-foreground/50"}`}
    >
      {m.cover_image_url ? <img src={m.cover_image_url} alt="" loading="lazy" className="h-24 w-full rounded-xl object-cover sm:h-32" /> : <div className="h-24 rounded-xl bg-muted sm:h-32" />}
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold leading-tight">{m.name}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" />{[placeOf(m), "India"].filter(Boolean).join(", ")}</p>
          </div>
          {onToggleSelect && (
            <Button
              variant={selected ? "default" : "outline"}
              size="sm"
              type="button"
              disabled={!canSelect}
              aria-pressed={selected}
              aria-label={selected ? `Unselect ${m.name}` : `Select ${m.name}`}
              onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
              className={`h-8 shrink-0 rounded-full px-3 text-xs font-semibold ${selected ? "bg-primary text-primary-foreground" : "hover:border-primary"}`}
            >
              {selected ? <Check /> : <Plus />}
              {canSelect ? (selected ? "Selected" : "Select") : "Unavailable"}
            </Button>
          )}
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{m.description}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {m.packaging_categories.map((c) => <span key={c} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{categoryLabel(c)}</span>)}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          <span><span className="text-muted-foreground">MOQ </span><b>{moq ? moq.value : "On request"}</b></span>
          <span><span className="text-muted-foreground">Lead time </span><b>{lead ? lead.value : "On request"}</b></span>
          <span className="ml-auto flex gap-3 text-sm" onClick={(e) => e.stopPropagation()}>
             <Link to={`/manufacturers/${m.slug}`} className="inline-flex items-center gap-1 text-foreground underline-offset-4 hover:underline">View profile<ArrowUpRight className="h-3.5 w-3.5" /></Link>
            {waHref && <a href={waHref} target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline">Chat now</a>}
            {m.website_url && <a href={m.website_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground underline-offset-4 hover:underline">Website</a>}
          </span>
        </div>
      </div>
    </article>
  );
}

export function ManufacturerCardSkeleton() {
  return <div className="flex gap-4 rounded-2xl border border-border p-4"><div className="h-32 w-28 shrink-0 animate-pulse rounded-xl bg-muted" /><div className="flex-1 space-y-3"><div className="h-6 w-1/2 animate-pulse rounded bg-muted" /><div className="h-4 w-1/3 animate-pulse rounded bg-muted" /><div className="h-16 animate-pulse rounded bg-muted" /></div></div>;
}
