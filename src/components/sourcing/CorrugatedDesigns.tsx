import { useState } from "react";
import { ArrowRight, Boxes, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BOX_DESIGNS, CATEGORIES, CLEAR_FILTERS, FAMILIES, PRIMARY_FILTERS, browseDesigns, selectedDesignRequirement, type CatalogueFilters, type PackagingDesign, type PackagingFamily } from "./packaging-catalogue";
import { POUCH_DESIGNS } from "./pouch-designs";
import { DesignCard } from "./DesignCard";
import { SHEET_DESIGNS } from "./sheet-catalogue";

const DESIGNS = [...SHEET_DESIGNS, ...BOX_DESIGNS, ...POUCH_DESIGNS];
const PAGE = 24;

export function CorrugatedDesigns({ onUseDesign }: { onUseDesign: (prefill: string, designs: PackagingDesign[]) => void }) {
  const [family, setFamily] = useState<PackagingFamily>("boxes");
  const [category, setCategory] = useState("all");
  const [filters, setFilters] = useState<CatalogueFilters>(CLEAR_FILTERS);
  const [limit, setLimit] = useState(PAGE);
  const [selected, setSelected] = useState<PackagingDesign | null>(null);
  const primary = PRIMARY_FILTERS[family];
  const shown = browseDesigns(DESIGNS, family, category, filters, "", "default");
  const reset = () => { setCategory("all"); setFilters(CLEAR_FILTERS); setLimit(PAGE); };
  const switchFamily = (next: PackagingFamily) => { setFamily(next); reset(); };
  const useDesigns = (designs: PackagingDesign[]) => {
    setSelected(null);
    requestAnimationFrame(() => onUseDesign(selectedDesignRequirement(designs), designs));
  };
  const active = primary.filter(f => filters[f.key] !== "all");
  return <section id="browse-designs" aria-label="Browse packaging designs" className="mt-8 border-t border-border pt-6 text-left md:mt-12 md:pt-8">
    <div><h2 className="text-xl font-semibold">Browse packaging designs</h2><p className="mt-1 text-sm text-muted-foreground">Find a format that fits your next product.</p></div>
    <div role="tablist" aria-label="Packaging category" className="mt-5 inline-flex rounded-full border border-border bg-muted p-1">
      {FAMILIES.map(f => <button type="button" key={f.id} role="tab" aria-selected={family === f.id} onClick={() => switchFamily(f.id)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${family === f.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{f.label}</button>)}
    </div>
    <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0" role="tablist" aria-label="Design categories">
      {CATEGORIES[family].map(item => { const on = category === item.id; return <button type="button" key={item.id} role="tab" aria-selected={on} onClick={() => { setCategory(item.id); setLimit(PAGE); }} className={`h-8 shrink-0 rounded-full border px-3.5 text-xs font-medium transition-colors ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"}`}>{item.label}</button>; })}
    </div>
    {primary.map(filter => <div key={filter.key} className="-mx-4 mt-2 flex items-center gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0" role="group" aria-label={filter.label}>
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{filter.label}</span>
      {["all", ...filter.options].map(value => { const on = filters[filter.key] === value; return <button type="button" key={value} aria-pressed={on} onClick={() => { setFilters(prev => ({ ...prev, [filter.key]: value })); setLimit(PAGE); }} className={`h-8 shrink-0 rounded-full border px-3.5 text-xs font-medium transition-colors ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"}`}>{value === "all" ? "All" : value}</button>; })}
    </div>)}
    {(active.length > 0 || category !== "all") && <div className="mt-3 flex flex-wrap items-center gap-1.5">
      {category !== "all" && <Button variant="secondary" size="sm" onClick={() => setCategory("all")} className="h-7 rounded-full text-xs" aria-label="Remove category filter">{CATEGORIES[family].find(c => c.id === category)?.label}<X /></Button>}
      {active.map(f => <Button key={f.key} variant="secondary" size="sm" className="h-7 rounded-full text-xs" onClick={() => setFilters(prev => ({ ...prev, [f.key]: "all" }))} aria-label={`Remove ${f.label} filter`}>{f.label}: {filters[f.key]}<X /></Button>)}
      <Button variant="link" size="sm" className="h-7 text-xs" onClick={reset}>Clear all filters</Button>
    </div>}
    <p aria-live="polite" className="my-3 text-xs text-muted-foreground">{shown.length} {shown.length === 1 ? "design" : "designs"}</p>
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
      {shown.slice(0, limit).map(d => <DesignCard key={d.id} design={d} onDetails={() => setSelected(d)} onUse={() => useDesigns([d])} />)}
    </div>
    {shown.length > limit && <div className="mt-6 text-center"><Button variant="outline" className="rounded-full" onClick={() => setLimit(l => l + PAGE)}>Show more designs ({shown.length - limit} more)</Button></div>}
    {shown.length === 0 && <div className="py-12 text-center"><Boxes className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 text-sm font-medium">No designs match your selection</p><p className="mt-1 text-xs text-muted-foreground">Try a different category or fewer filters.</p><Button variant="link" onClick={reset}>Reset filters</Button></div>}
    <Sheet open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg" onCloseAutoFocus={e => e.preventDefault()}>
        {selected && <><SheetHeader className="pr-6 text-left"><SheetTitle>{selected.name}</SheetTitle><SheetDescription>{selected.description}</SheetDescription></SheetHeader>
          <img src={selected.image} alt={selected.name} width={640} height={640} className="mt-5 aspect-square w-full rounded-lg bg-card object-contain" />
          <p className="mt-2 text-xs text-muted-foreground">{selected.illustrative ? "Illustrative reference — not a supplier product." : "Existing catalogue reference — not a verified supplier specification."}</p>
          <dl className="mt-4 divide-y divide-border text-sm">{PRIMARY_FILTERS[selected.family].map(f => <div key={f.key} className="grid grid-cols-2 gap-3 py-2"><dt className="text-muted-foreground">{f.label}</dt><dd className="font-medium">{selected.attributes[f.key]?.join(", ") || "Unspecified"}</dd></div>)}{selected.details?.map(([k, v]) => <div key={k} className="grid grid-cols-2 gap-3 py-2"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Material structure, finishes, quantity and suitability require manufacturer confirmation.</p>
          <Button className="mt-6 w-full rounded-full" onClick={() => useDesigns([selected])}>Use this design <ArrowRight /></Button>
        </>}
      </SheetContent>
    </Sheet>
  </section>;
}
