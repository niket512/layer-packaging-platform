import { useEffect, useState } from "react";
import { ArrowRight, Bookmark, Boxes, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BOX_DESIGNS, CATEGORIES, CLEAR_FILTERS, FAMILIES, PRIMARY_FILTERS, SECONDARY_FILTERS, browseDesigns, readShortlist, selectedDesignRequirement, type CatalogueFilters, type FilterDefinition, type PackagingDesign, type PackagingFamily } from "./packaging-catalogue";
import { POUCH_DESIGNS } from "./pouch-designs";
import { DesignCard } from "./DesignCard";

const DESIGNS = [...BOX_DESIGNS, ...POUCH_DESIGNS];
const SAVE_KEY = "snaplogo.packaging.design-shortlist";

export function CorrugatedDesigns({ onUseDesign }: { onUseDesign: (prefill: string, designs: PackagingDesign[]) => void }) {
  const [family, setFamily] = useState<PackagingFamily>("boxes");
  const [category, setCategory] = useState("all");
  const [filters, setFilters] = useState<CatalogueFilters>(CLEAR_FILTERS);
  const [more, setMore] = useState(false);
  const [selected, setSelected] = useState<PackagingDesign | null>(null);
  const [shortlistOpen, setShortlistOpen] = useState(false);
  const [saved, setSaved] = useState<string[]>(() => {
    try { return readShortlist(JSON.parse(localStorage.getItem(SAVE_KEY) ?? "[]"), DESIGNS); } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(saved)); } catch { /* Session state still works. */ } }, [saved]);
  const available = family === "boxes" || family === "pouches";
  const primary = PRIMARY_FILTERS[family as "boxes" | "pouches"];
  const secondary = SECONDARY_FILTERS.filter(f => !primary.some(p => p.key === f.key));
  const definitions = [...primary, ...secondary];
  const shown = browseDesigns(DESIGNS, family, category, filters, "", "default");
  const shortlisted = DESIGNS.filter(d => saved.includes(d.id));
  const reset = () => { setCategory("all"); setFilters(CLEAR_FILTERS); };
  const switchFamily = (next: PackagingFamily) => { setFamily(next); reset(); setMore(false); };
  const toggleSave = (id: string) => setSaved(previous => previous.includes(id) ? previous.filter(s => s !== id) : [...previous, id]);
  const useDesigns = (designs: PackagingDesign[]) => {
    setSelected(null); setShortlistOpen(false);
    requestAnimationFrame(() => onUseDesign(selectedDesignRequirement(designs), designs));
  };
  const filterControl = (filter: FilterDefinition) => <div key={filter.key}>
    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{filter.label}</label>
    <Select value={filters[filter.key]} onValueChange={value => setFilters(previous => ({ ...previous, [filter.key]: value }))}>
      <SelectTrigger aria-label={filter.label} className="h-9 min-w-0 bg-card text-xs"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="all">All</SelectItem>{filter.options.map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}<SelectItem value="unspecified">Unspecified</SelectItem></SelectContent>
    </Select>
  </div>;
  const active = definitions.filter(f => filters[f.key] !== "all");
  return <TooltipProvider><section aria-label="Browse packaging designs" className="mt-12 border-t border-border pt-8 text-left">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-xl font-semibold">Browse packaging designs</h2><p className="mt-1 text-sm text-muted-foreground">Find a format that fits your next product.</p></div>
      <Button variant="outline" size="sm" onClick={() => setShortlistOpen(true)} className="rounded-full"><Bookmark />Shortlist <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs text-primary">{saved.length}</span></Button>
    </div>
    <div role="tablist" aria-label="Packaging category" className="mt-5 flex gap-1 overflow-x-auto border-b border-border pb-2">
      {FAMILIES.map(f => <Button key={f.id} role="tab" aria-selected={family === f.id} variant={family === f.id ? "default" : "ghost"} size="sm" onClick={() => switchFamily(f.id)} className="shrink-0 rounded-full text-xs">{f.label}</Button>)}
    </div>
    {available ? <>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Design categories">
        {CATEGORIES[family].map(item => {
          const representative = DESIGNS.find(d => d.family === family && (item.id === "all" || d.categories.includes(item.id)));
          return <Button key={item.id} variant="outline" role="tab" aria-selected={category === item.id} onClick={() => setCategory(item.id)} className={`h-24 w-28 shrink-0 flex-col gap-1 rounded-lg p-2 text-[11px] ${category === item.id ? "border-primary bg-accent text-primary" : "bg-card text-muted-foreground"}`}>
            {representative ? <img src={representative.image} alt="" width={64} height={52} loading="lazy" className="h-12 w-16 object-contain" /> : <Boxes className="!h-10 !w-10" />}
            <span className="whitespace-normal text-center leading-tight">{item.label}</span>
          </Button>;
        })}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{primary.map(filterControl)}</div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" aria-expanded={more} onClick={() => setMore(!more)} className="h-8 px-0 text-xs text-muted-foreground"><SlidersHorizontal />More filters</Button>
        <p className="text-[11px] text-muted-foreground">Material, finish & order quantity: unspecified unless confirmed.</p>
      </div>
      {more && <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-3 sm:grid-cols-3">{secondary.map(filterControl)}</div>}
      {(active.length > 0 || category !== "all") && <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {category !== "all" && <Button variant="secondary" size="sm" onClick={() => setCategory("all")} className="h-7 rounded-full text-xs" aria-label="Remove category filter">{CATEGORIES[family].find(c => c.id === category)?.label}<X /></Button>}
        {active.map(f => <Button key={f.key} variant="secondary" size="sm" className="h-7 rounded-full text-xs" onClick={() => setFilters(prev => ({ ...prev, [f.key]: "all" }))} aria-label={`Remove ${f.label} filter`}>{f.label}: {filters[f.key]}<X /></Button>)}
        <Button variant="link" size="sm" className="h-7 text-xs" onClick={reset}>Clear all filters</Button>
      </div>}
      <p aria-live="polite" className="my-3 text-xs text-muted-foreground">{shown.length} {shown.length === 1 ? "design" : "designs"}</p>
      <div className="grid grid-cols-1 gap-4 min-[440px]:grid-cols-2 xl:grid-cols-3">
        {shown.map(d => <DesignCard key={d.id} design={d} saved={saved.includes(d.id)} onSave={() => toggleSave(d.id)} onDetails={() => setSelected(d)} onUse={() => useDesigns([d])} />)}
      </div>
      {shown.length === 0 && <div className="py-12 text-center"><Boxes className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 text-sm font-medium">No designs match your selection</p><p className="mt-1 text-xs text-muted-foreground">Try a different category or fewer filters.</p><Button variant="link" onClick={reset}>Reset filters</Button></div>}
    </> : <div className="py-16 text-center"><Boxes className="mx-auto h-10 w-10 text-muted-foreground" /><h3 className="mt-4 text-lg font-semibold">{FAMILIES.find(f => f.id === family)?.label} designs coming soon</h3><Button variant="link" onClick={() => switchFamily("boxes")}>Browse corrugated boxes <ArrowRight /></Button></div>}
    <Sheet open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg" onCloseAutoFocus={e => e.preventDefault()}>
        {selected && <><SheetHeader className="pr-6 text-left"><SheetTitle>{selected.name}</SheetTitle><SheetDescription>{selected.description}</SheetDescription></SheetHeader>
          <img src={selected.image} alt={selected.name} width={640} height={640} className="mt-5 aspect-square w-full rounded-lg bg-card object-contain" />
          <p className="mt-2 text-xs text-muted-foreground">{selected.illustrative ? "Illustrative reference — not a supplier product." : "Existing catalogue reference — not a verified supplier specification."}</p>
          <dl className="mt-4 divide-y divide-border text-sm">{[...PRIMARY_FILTERS[selected.family === "boxes" ? "boxes" : "pouches"], ...SECONDARY_FILTERS.filter(f => f.key !== "printing")].map(f => <div key={f.key} className="grid grid-cols-2 gap-3 py-2"><dt className="text-muted-foreground">{f.label}</dt><dd className="font-medium">{selected.attributes[f.key]?.join(", ") || "Unspecified"}</dd></div>)}</dl>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Material structure, finishes, quantity and suitability require manufacturer confirmation.</p>
          <Button className="mt-6 w-full rounded-full" onClick={() => useDesigns([selected])}>Use this design <ArrowRight /></Button>
        </>}
      </SheetContent>
    </Sheet>
    <Sheet open={shortlistOpen} onOpenChange={setShortlistOpen}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg" onCloseAutoFocus={e => e.preventDefault()}>
        <SheetHeader className="pr-6 text-left"><SheetTitle>Your shortlist ({saved.length})</SheetTitle><SheetDescription>Packaging references for your sourcing request.</SheetDescription></SheetHeader>
        {!shortlisted.length ? <p className="py-12 text-center text-sm text-muted-foreground">No saved designs yet.</p> : <>
          <div className="mt-5 divide-y divide-border">{shortlisted.map(d => <div key={d.id} className="flex items-center gap-3 py-3"><img src={d.image} alt={d.name} width={64} height={64} className="h-16 w-16 shrink-0 rounded-lg object-contain" /><div className="min-w-0 flex-1"><p className="text-sm font-medium">{d.name}</p><p className="mt-1 text-xs text-muted-foreground">{FAMILIES.find(f => f.id === d.family)?.label}</p></div><Button variant="ghost" size="icon" aria-label={`Remove ${d.name} from shortlist`} onClick={() => toggleSave(d.id)}><X /></Button></div>)}</div>
          <Button className="mt-6 w-full rounded-full" onClick={() => useDesigns(shortlisted)}>Request quotes for shortlist <ArrowRight /></Button>
        </>}
      </SheetContent>
    </Sheet>
  </section></TooltipProvider>;
}
