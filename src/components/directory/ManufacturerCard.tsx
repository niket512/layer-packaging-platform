import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { CUSTOMIZATION, type DirectoryManufacturer, categoryLabel, enquiryHref, placeOf } from "@/data/directory";

export function ManufacturerCard({ m }: { m: DirectoryManufacturer }) {
  const moq = m.minimum_order_quantities[0];
  const lead = m.lead_times[0];
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      {m.cover_image_url && (
        <img src={m.cover_image_url} alt={`${categoryLabel(m.packaging_categories[0])} — representative image`} loading="lazy" width={944} height={704} className="aspect-[16/9] w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-lg font-semibold text-foreground">{m.name}</h3>
        {placeOf(m) && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{placeOf(m)}</p>
        )}
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{m.description}</p>
        <dl className="mt-4 space-y-2 text-[13px]">
          <div><dt className="inline font-semibold text-foreground">Categories: </dt><dd className="inline text-muted-foreground">{m.packaging_categories.map(categoryLabel).join(" · ")}</dd></div>
          {m.customization_capabilities.length > 0 && (
            <div><dt className="inline font-semibold text-foreground">Customisation: </dt><dd className="inline text-muted-foreground">{m.customization_capabilities.map((c) => CUSTOMIZATION[c]).join(" · ")}</dd></div>
          )}
          <div><dt className="inline font-semibold text-foreground">MOQ: </dt><dd className="inline text-muted-foreground">{moq ? `${moq.value} (${moq.scope.toLowerCase()})` : "Not yet confirmed"}</dd></div>
          {lead && <div><dt className="inline font-semibold text-foreground">Lead time: </dt><dd className="inline text-muted-foreground">{lead.value} ({lead.scope.toLowerCase()})</dd></div>}
        </dl>
        {m.website_url && (
          <a href={m.website_url} target="_blank" rel="noopener noreferrer" className="mt-3 text-xs text-primary hover:underline">{new URL(m.website_url).hostname}</a>
        )}
        <div className="mt-auto flex gap-2 pt-5">
          <Link to={`/manufacturers/${m.slug}`} className="flex-1 rounded-full bg-primary py-2.5 text-center text-xs font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90">View Supplier</Link>
          <a href={enquiryHref(m.name)} className="flex-1 rounded-full border border-border py-2.5 text-center text-xs font-bold uppercase tracking-wide text-foreground hover:border-primary hover:text-primary">Request a Quote</a>
        </div>
      </div>
    </article>
  );
}

export function ManufacturerCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-[16/9] animate-pulse bg-muted" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-12 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
