import { Link } from "react-router-dom";
import { ArrowUpRight, Check, MapPin } from "lucide-react";
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
  const waHref = waText
    ? `https://wa.me/${waDigits(m.phone!)}?text=${encodeURIComponent(waText)}`
    : whatsappHref(m.name, m.phone!);
  return (
    <article className={`grid grid-cols-[80px_minmax(0,1fr)] gap-4 py-6 sm:grid-cols-[128px_minmax(0,1fr)] ${selected ? "rounded-xl bg-primary/5" : ""}`}>
      {m.cover_image_url ? <img src={m.cover_image_url} alt={`${m.name} — representative packaging image`} loading="lazy" width={128} height={172} className="h-28 w-full rounded-xl object-cover sm:h-44" /> : <div className="h-28 rounded-xl bg-muted sm:h-44" />}
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-semibold leading-tight">{m.name}</h2>
          <Link to={`/manufacturers/${m.slug}`} aria-label={`View ${m.name} profile`} className="shrink-0 text-muted-foreground hover:text-foreground"><ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" />{[placeOf(m), "India"].filter(Boolean).join(", ")}</p>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed">{m.description}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">{m.packaging_categories.map((c) => <span key={c} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{categoryLabel(c)}</span>)}</div>
        <dl className="mt-4 grid grid-cols-1 gap-3 border-t border-border pt-3 sm:grid-cols-2">
          <div><dt className="text-xs text-muted-foreground">Starting MOQ</dt><dd className="mt-1 text-base font-semibold">{moq ? `${moq.value}*` : "On request"}</dd>{moq && <p className="mt-1 text-xs text-muted-foreground">*{moq.scope}</p>}</div>
          <div><dt className="text-xs text-muted-foreground">Lead time</dt><dd className="mt-1 text-base font-semibold">{m.lead_times.length ? m.lead_times.map((l) => <div key={l.scope}>{l.value}<span className="mt-0.5 block text-xs font-normal text-muted-foreground">{l.scope}</span></div>) : "On request"}</dd></div>
        </dl>
        <p className="mt-3 text-sm text-primary">{[m.customization_capabilities.includes("custom-printing") ? "Custom printing" : null, m.printing_capabilities.includes("custom-manufacturing") ? "Custom manufacturing" : null].filter(Boolean).join(" · ")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {onToggleSelect && (
            <Button variant={selected ? "default" : "outline"} className="rounded-full px-4" aria-pressed={selected} onClick={onToggleSelect}>
              <Check className="mr-1 h-4 w-4" />{selected ? "Selected" : "Select"}
            </Button>
          )}
          <Button asChild variant="secondary" className="min-w-32 flex-1 rounded-full"><Link to={`/manufacturers/${m.slug}`}>View profile</Link></Button>
          {m.phone && <Button asChild className="whatsapp-cta rounded-full px-5"><a href={m.phone ? waHref : undefined} target="_blank" rel="noopener noreferrer">WhatsApp</a></Button>}
          {m.website_url && <Button asChild variant="outline" className="rounded-full px-5"><a href={m.website_url} target="_blank" rel="noopener noreferrer">Website</a></Button>}
        </div>
      </div>
    </article>
  );
}

export function ManufacturerCardSkeleton() {
  return <div className="flex gap-4 py-6"><div className="h-44 w-32 shrink-0 animate-pulse rounded-xl bg-muted" /><div className="flex-1 space-y-3"><div className="h-6 w-1/2 animate-pulse rounded bg-muted" /><div className="h-4 w-1/3 animate-pulse rounded bg-muted" /><div className="h-24 animate-pulse rounded bg-muted" /></div></div>;
}
