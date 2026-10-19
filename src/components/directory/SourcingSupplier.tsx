import { ArrowUpRight, Bookmark, Check, MapPin, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { categoryLabel, placeOf, waDigits, type DirectoryManufacturer } from "@/data/directory";

interface Props { manufacturer: DirectoryManufacturer; reason: string; saved: boolean; onSave: () => void; requirement: string }

export function SourcingSupplier({ manufacturer: m, reason, saved, onSave, requirement }: Props) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="relative aspect-[2.3/1] overflow-hidden bg-muted">
        {m.cover_image_url && <img src={m.cover_image_url} alt={`${m.name} packaging`} className="h-full w-full object-cover" />}
        <Button variant="outline" size="icon" aria-label={`${saved ? "Remove" : "Save"} ${m.name}`} aria-pressed={saved} onClick={onSave} className="absolute right-3 top-3 h-8 w-8 rounded-full bg-background">{saved ? <Check className="text-primary" /> : <Bookmark />}</Button>
      </div>
      <div className="p-4">
        <Link to={`/manufacturers/${m.slug}`} className="flex items-center justify-between gap-2 text-base font-semibold hover:text-primary">{m.name}<ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" /></Link>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{placeOf(m) || "Location not listed"}</p>
        <p className="mt-3 min-h-[60px] text-sm leading-relaxed">{reason}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">{m.packaging_categories.slice(0, 2).map(c => <span key={c} className="rounded bg-muted px-2 py-1 text-[11px] text-muted-foreground">{categoryLabel(c)}</span>)}</div>
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs">
          <div><dt className="text-muted-foreground">Minimum order</dt><dd className="mt-1 font-medium">{m.minimum_order_quantities[0]?.value ?? "Ask supplier"}</dd></div>
          <div><dt className="text-muted-foreground">Lead time</dt><dd className="mt-1 font-medium">{m.lead_times[0]?.value ?? "Ask supplier"}</dd>{m.lead_times[0] && <p className="mt-1 text-[10px] text-muted-foreground">{m.lead_times[0].scope}</p>}</div>
        </dl>
        <Button asChild variant="outline" className="mt-4 w-full rounded-full"><a href={m.phone ? `https://wa.me/${waDigits(m.phone)}?text=${encodeURIComponent(`Hi ${m.name}, I found you on Snaplogo. My packaging requirement: ${requirement}`)}` : `mailto:contact@snapit.club?subject=${encodeURIComponent(`Enquiry for ${m.name}`)}`} target="_blank" rel="noopener noreferrer"><MessageCircle />Contact supplier</a></Button>
      </div>
    </article>
  );
}