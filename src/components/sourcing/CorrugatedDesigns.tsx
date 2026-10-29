import { useState } from "react";
import { ArrowRight, Boxes, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DESIGN_SPECS, EMPTY_FILTERS, designRequirement, filterDesigns, type BoxCategory, type DesignFilters, type DesignSpec } from "./corrugated-catalogue";
import kraftShip from "@/assets/design-ship-kraft.jpg";
import whiteMailer from "@/assets/design-mailer-white.jpg";
import printedKraft from "@/assets/design-printed-kraft.jpg";
import tealMailer from "@/assets/design-mailer-teal.jpg";
import blackMailer from "@/assets/design-mailer-black.jpg";
import dieCut from "@/assets/design-diecut-open.jpg";

const IMAGES: Record<string, string> = { "kraft-ship": kraftShip, "die-cut": dieCut, "logo-mailer": whiteMailer, "pattern-mailer": tealMailer, "brand-shipper": printedKraft, "premium-mailer": blackMailer };
const CATEGORIES: { key: BoxCategory; label: string; image?: string }[] = [
  { key: "all", label: "All boxes" },
  { key: "shipping", label: "Shipping", image: kraftShip },
  { key: "mailer", label: "Mailers", image: whiteMailer },
  { key: "product", label: "Product boxes", image: blackMailer },
  { key: "die-cut", label: "Die-cut", image: dieCut },
  { key: "printed", label: "Printed", image: tealMailer },
];
const FILTERS: { key: keyof DesignFilters; label: string }[] = [
  { key: "style", label: "Box style" }, { key: "printing", label: "Printing" },
  { key: "material", label: "Material" }, { key: "useCase", label: "Use case" },
];

export function CorrugatedDesigns({ onUseDesign }: { onUseDesign: (prefill: string) => void }) {
  const [category, setCategory] = useState<BoxCategory>("all");
  const [filters, setFilters] = useState<DesignFilters>(EMPTY_FILTERS);
  const [selected, setSelected] = useState<DesignSpec | null>(null);
  const shown = filterDesigns(category, filters);
  const hasFilters = category !== "all" || Object.values(filters).some(value => value !== "all");
  const reset = () => { setCategory("all"); setFilters(EMPTY_FILTERS); };
  return (
    <section aria-label="Browse corrugated box designs" className="mt-12 border-t border-border pt-8 text-left">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold">Browse corrugated box designs</h2>
          <p className="mt-1 text-sm text-muted-foreground">Shipping essentials, branded mailers and gifting formats.</p>
        </div>
        <span className="text-xs text-muted-foreground">Design references</span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6" role="tablist" aria-label="Design categories">
        {CATEGORIES.map(item => (
          <Button key={item.key} variant="outline" type="button" role="tab" aria-selected={category === item.key} onClick={() => setCategory(item.key)}
            className={`h-auto min-w-0 flex-col gap-2 rounded-lg px-1 py-2 text-xs ${category === item.key ? "border-primary bg-accent text-primary" : "bg-card text-muted-foreground"}`}>
            {item.image ? <img src={item.image} alt="" loading="lazy" className="h-12 w-16 rounded-md object-cover" /> : <span className="flex h-12 w-16 items-center justify-center rounded-md bg-muted"><Boxes className="!h-6 !w-6" /></span>}
            {item.label}
          </Button>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><SlidersHorizontal className="h-3.5 w-3.5" />Refine designs</div>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {FILTERS.map(filter => <Select key={filter.key} value={filters[filter.key]} onValueChange={value => setFilters(previous => ({ ...previous, [filter.key]: value }))}>
          <SelectTrigger aria-label={filter.label} className="text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{filter.label}: All</SelectItem>
            {[...new Set(DESIGN_SPECS.map(design => design[filter.key]))].map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}
          </SelectContent>
        </Select>)}
      </div>
      <div className="mt-3 flex h-8 items-center justify-between">
        <p aria-live="polite" className="text-xs text-muted-foreground">{shown.length} {shown.length === 1 ? "design" : "designs"}</p>
        {hasFilters && <Button variant="link" size="sm" onClick={reset} className="h-8 px-0 text-xs">Clear filters</Button>}
      </div>
      <div className="mt-2 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3">
        {shown.map(d => (
          <article key={d.id} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="aspect-square overflow-hidden bg-muted">
              <Button variant="ghost" aria-label={`View ${d.name}`} onClick={() => setSelected(d)} className="h-full w-full rounded-none p-0">
                <img src={IMAGES[d.id]} alt={d.name} loading="lazy" width={640} height={640} className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.03]" />
              </Button>
            </div>
            <div className="flex flex-1 flex-col p-3">
              <h3 className="text-sm font-semibold leading-snug text-foreground">{d.name}</h3>
              <p className="mt-1.5 text-xs text-primary">{d.style} · {d.printing}{d.material !== "To be confirmed" ? ` · ${d.material}` : ""}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{d.description}</p>
              <Button variant="link" size="sm" onClick={() => setSelected(d)} className="mt-auto h-9 justify-start px-0 pt-3 text-xs">View design <ArrowRight /></Button>
            </div>
          </article>
        ))}
      </div>
      {shown.length === 0 && <div className="py-12 text-center"><Boxes className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 text-sm font-medium">No designs match these filters</p><Button variant="link" onClick={reset}>Clear filters</Button></div>}
      <Sheet open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg" onCloseAutoFocus={event => event.preventDefault()}>
          {selected && <>
            <SheetHeader className="pr-6 text-left"><SheetTitle>{selected.name}</SheetTitle><SheetDescription>{selected.description}</SheetDescription></SheetHeader>
            <img src={IMAGES[selected.id]} alt={selected.name} className="mt-5 aspect-square w-full rounded-lg object-cover" />
            <dl className="mt-5 divide-y divide-border text-sm">
              {FILTERS.map(filter => <div key={filter.key} className="grid grid-cols-2 gap-3 py-2.5"><dt className="text-muted-foreground">{filter.label}</dt><dd className="font-medium">{selected[filter.key]}</dd></div>)}
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Illustrative reference, not a supplier listing. Board grade, finishes and suitability are subject to manufacturer confirmation.</p>
            <Button size="pill" className="mt-6 w-full" onClick={() => { const draft = designRequirement(selected); setSelected(null); requestAnimationFrame(() => onUseDesign(draft)); }}>Use this design <ArrowRight /></Button>
          </>}
        </SheetContent>
      </Sheet>
    </section>
  );
}
