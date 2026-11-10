import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Boxes, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BOX_DESIGNS, CATEGORIES, CLEAR_FILTERS, FAMILIES, PRIMARY_FILTERS, browseDesigns, selectedDesignRequirement, type CatalogueFilters, type PackagingDesign, type PackagingFamily } from "./packaging-catalogue";
import { POUCH_DESIGNS } from "./pouch-designs";
import { DesignCard } from "./DesignCard";
import { SHEET_DESIGNS } from "./sheet-catalogue";
import { trackDesign } from "@/lib/visitor-tracking";

const DESIGNS = [...SHEET_DESIGNS, ...BOX_DESIGNS, ...POUCH_DESIGNS];
const PAGE = 24;

export function CorrugatedDesigns({ onUseDesign, onlyFamily, selectedFamily, onFamilyChange }: { onUseDesign: (prefill: string, designs: PackagingDesign[]) => void; onlyFamily?: PackagingFamily; selectedFamily?: PackagingFamily; onFamilyChange?: (family: PackagingFamily) => void }) {
  const [localFamily, setFamily] = useState<PackagingFamily>(onlyFamily ?? "boxes");
  const family = onlyFamily ?? selectedFamily ?? localFamily;
  const [category, setCategory] = useState("all");
  const [filters, setFilters] = useState<CatalogueFilters>(CLEAR_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const [selected, setSelected] = useState<PackagingDesign | null>(null);
  const primary = PRIMARY_FILTERS[family];
  const shown = browseDesigns(DESIGNS, family, category, filters, "", "default");
  const reset = () => { setCategory("all"); setFilters(CLEAR_FILTERS); setLimit(PAGE); };
  const switchFamily = (next: PackagingFamily) => { setFamily(next); onFamilyChange?.(next); reset(); };
  useEffect(() => { setCategory("all"); setFilters(CLEAR_FILTERS); setLimit(PAGE); setSelected(null); }, [family]);
  const useDesigns = (designs: PackagingDesign[]) => {
    designs.forEach(design => trackDesign("selected", design.id, { position: shown.findIndex(d => d.id === design.id) + 1, family, category }));
    window.__lovableEvents?.track?.("project.design_used", { family: designs[0]?.family ?? family, count: designs.length });
    setSelected(null);
    requestAnimationFrame(() => onUseDesign(selectedDesignRequirement(designs), designs));
  };
  const active = primary.filter(f => filters[f.key] !== "all");
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || shown.length <= limit) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) setLimit(l => Math.min(l + PAGE, shown.length));
    }, { rootMargin: "600px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [shown.length, limit]);
  return <section id="browse-designs" aria-label="Browse packaging designs" className="mt-8 border-t border-border pt-6 text-left md:mt-12 md:pt-8">
    <div><h2 className="text-xl font-semibold">Explore formats</h2></div>
    {!onlyFamily && <div role="tablist" aria-label="Packaging category" className="mt-5 flex gap-1 overflow-x-auto border-b border-border pb-2">
      {FAMILIES.map(f => <Button key={f.id} role="tab" aria-selected={family === f.id} variant={family === f.id ? "default" : "ghost"} size="sm" onClick={() => switchFamily(f.id)} className="shrink-0 rounded-full text-xs">{f.label}</Button>)}
    </div>}
    <div className="mt-4 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Design categories">
      {CATEGORIES[family].map(item => {
        const representative = DESIGNS.find(d => d.family === family && (item.id === "all" || d.categories.includes(item.id)));
        return <Button key={item.id} variant="outline" role="tab" aria-selected={category === item.id} onClick={() => { setCategory(item.id); setLimit(PAGE); }} className={`h-20 w-24 shrink-0 flex-col gap-1 rounded-xl p-2 md:h-24 md:w-28 hover:bg-muted text-[11px] ${category === item.id ? "border-primary bg-accent text-primary" : "bg-card text-muted-foreground"}`}>
          {representative ? <img src={representative.image} alt="" width={64} height={52} loading="lazy" className="h-12 w-16 object-contain" /> : <Boxes className="!h-10 !w-10" />}
          <span className="whitespace-normal text-center leading-tight">{item.label}</span>
        </Button>;
      })}
    </div>
    <Button variant="outline" size="sm" onClick={() => setShowFilters(v => !v)} aria-expanded={showFilters} className="mt-3 rounded-full text-xs sm:hidden"><SlidersHorizontal />Filters{active.length > 0 && ` (${active.length})`}</Button>
    <div className={`mt-3 grid-cols-2 gap-2 sm:mt-4 sm:grid sm:grid-cols-2 ${showFilters ? "grid" : "hidden"}`}>{primary.map(filter => <div key={filter.key}>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{filter.label}</label>
      <Select value={filters[filter.key]} onValueChange={value => { setFilters(previous => ({ ...previous, [filter.key]: value })); setLimit(PAGE); }}>
        <SelectTrigger aria-label={filter.label} className="h-9 min-w-0 bg-card text-xs"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="all">All</SelectItem>{filter.options.map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}<SelectItem value="unspecified">Unspecified</SelectItem></SelectContent>
      </Select>
    </div>)}</div>
    {(active.length > 0 || category !== "all") && <div className="mt-3 flex flex-wrap items-center gap-1.5">
      {category !== "all" && <Button variant="secondary" size="sm" onClick={() => setCategory("all")} className="h-7 rounded-full text-xs" aria-label="Remove category filter">{CATEGORIES[family].find(c => c.id === category)?.label}<X /></Button>}
      {active.map(f => <Button key={f.key} variant="secondary" size="sm" className="h-7 rounded-full text-xs" onClick={() => setFilters(prev => ({ ...prev, [f.key]: "all" }))} aria-label={`Remove ${f.label} filter`}>{f.label}: {filters[f.key]}<X /></Button>)}
      <Button variant="link" size="sm" className="h-7 text-xs" onClick={reset}>Clear all filters</Button>
    </div>}
    <p aria-live="polite" className="my-3 text-xs text-muted-foreground">{shown.length} {shown.length === 1 ? "design" : "designs"}</p>
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
      {shown.slice(0, limit).map((d, index) => <DesignCard key={d.id} design={d} position={index + 1} category={category} onDetails={() => { trackDesign("opened", d.id, { position: index + 1, family, category }); setSelected(d); }} onUse={() => useDesigns([d])} />)}
    </div>
    {shown.length > limit && (
      <div ref={sentinelRef} aria-hidden className="h-4" />
    )}
    {shown.length === 0 && <div className="py-12 text-center"><Boxes className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 text-sm font-medium">No designs match your selection</p><p className="mt-1 text-xs text-muted-foreground">Try a different category or fewer filters.</p><Button variant="link" onClick={reset}>Reset filters</Button></div>}
    <Sheet open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg" onCloseAutoFocus={e => e.preventDefault()}>
        {selected && <><SheetHeader className="pr-6 text-left"><SheetTitle>{selected.name}</SheetTitle><SheetDescription>{selected.description}</SheetDescription></SheetHeader>
          <img src={selected.image} alt={selected.name} width={640} height={640} className="mt-5 aspect-square w-full rounded-lg bg-card object-contain" />
          <p className="mt-2 text-xs text-muted-foreground">Reference image — specs to be confirmed with the manufacturer.</p>
          <dl className="mt-4 divide-y divide-border text-sm">{PRIMARY_FILTERS[selected.family].map(f => <div key={f.key} className="grid grid-cols-2 gap-3 py-2"><dt className="text-muted-foreground">{f.label}</dt><dd className="font-medium">{selected.attributes[f.key]?.join(", ") || "Unspecified"}</dd></div>)}{selected.details?.map(([k, v]) => <div key={k} className="grid grid-cols-2 gap-3 py-2"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
          <Button className="mt-6 w-full rounded-full" onClick={() => useDesigns([selected])}>Get a quote for this design <ArrowRight /></Button>
        </>}
      </SheetContent>
    </Sheet>
  </section>;
}
