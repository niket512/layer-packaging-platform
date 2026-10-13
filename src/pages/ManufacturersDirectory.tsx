import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequirementForm } from "@/components/directory/RequirementForm";
import { DirectoryFooter } from "@/components/directory/DirectoryChrome";
import { ManufacturerCard, ManufacturerCardSkeleton } from "@/components/directory/ManufacturerCard";
import { fetchPublishedManufacturers, categoryLabel, placeOf, PACKAGING_CATEGORIES, moqUnits, waDigits, type DirectoryManufacturer } from "@/data/directory";

const MOQ_OPTIONS = [
  { value: "", label: "Any quantity" },
  { value: "500", label: "Up to 500 units" },
  { value: "2000", label: "Up to 2,000 units" },
];
const CUSTOM_OPTIONS = [
  { value: "", label: "Any customization" },
  { value: "custom-printing", label: "Custom printing" },
  { value: "custom-sizes", label: "Custom sizes" },
  { value: "custom-structures", label: "Custom structures" },
];
const selectCls = "h-9 rounded-full border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function ManufacturersDirectory() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") ?? "";
  const moq = params.get("moq") ?? "";
  const custom = params.get("custom") ?? "";
  const loc = params.get("state") ?? "";
  const sort = params.get("sort") ?? "relevance";
  const { data = [], isLoading, isError, refetch } = useQuery({ queryKey: ["directory"], queryFn: fetchPublishedManufacturers });
  const [selected, setSelected] = useState<string[]>([]);
  const [contact, setContact] = useState("");
  const [reqText, setReqText] = useState("");
  useEffect(() => {
    document.title = "Find packaging manufacturers in India | Snaplogo";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Share your packaging requirement, pick manufacturers and WhatsApp them directly.");
  }, []);
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };
  const toggle = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const states = useMemo(() => [...new Set(data.map((m) => m.state).filter(Boolean) as string[])].sort(), [data]);
  const counts = useMemo(() => Object.fromEntries(PACKAGING_CATEGORIES.map((c) => [c.key, data.filter((m) => m.packaging_categories.includes(c.key)).length])), [data]);
  const passesFilters = (m: DirectoryManufacturer) => {
    const units = moqUnits(m);
    return (!category || m.packaging_categories.includes(category as never))
      && (!moq || (units !== null && units <= Number(moq)))
      && (!custom || m.customization_capabilities.includes(custom as never))
      && (!loc || m.state === loc);
  };
  const results = useMemo(() => {
    const rows = data.filter(passesFilters);
    if (sort === "name") rows.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "location") rows.sort((a, b) => placeOf(a).localeCompare(placeOf(b)));
    if (sort === "moq") rows.sort((a, b) => (moqUnits(a) ?? Infinity) - (moqUnits(b) ?? Infinity));
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, category, moq, custom, loc, sort]);
  const hasFilters = !!(category || moq || custom || loc);
  const pickCategory = (key: string) => {
    update("category", category === key ? "" : key);
    document.getElementById("directory")?.scrollIntoView({ behavior: "smooth" });
  };
  const clearAll = () => { setParams(new URLSearchParams()); };
  const waText = `Hi, I found you on Snaplogo. My packaging requirement: ${reqText.trim() || "(details)"}`;
  const selectedMakers = data.filter((m) => selected.includes(m.id) && m.phone);

  return (
    <div className="theme-directory min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-content px-4 pb-24 md:px-6">
        {/* 1. Requirement-first hero */}
        <section className="py-10 md:py-14">
          <p className="text-xs font-semibold uppercase tracking-[1.5px] text-primary">The D2C packaging network</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">Tell us what you need. We'll match the maker.</h1>
          <p className="mt-2 max-w-xl text-base text-muted-foreground">Share your packaging requirement, select manufacturers below, and WhatsApp them directly.</p>
          <div className="mt-5">
            <RequirementForm
              manufacturers={data}
              selected={selected}
              onToggle={toggle}
              contact={contact}
              onContact={setContact}
              text={reqText}
              onText={setReqText}
              images={images}
              onImages={setImages}
            />
          </div>
        </section>

        {/* 2. Visual categories */}
        <section id="categories" aria-labelledby="cat-h" className="border-t border-border py-8">
          <h2 id="cat-h" className="text-lg font-semibold">Browse by packaging type</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PACKAGING_CATEGORIES.map((c) => (
              <button key={c.key} type="button" onClick={() => pickCategory(c.key)} aria-pressed={category === c.key} className={`group overflow-hidden rounded-xl border text-left transition-colors ${category === c.key ? "border-primary" : "border-border hover:border-muted-foreground"}`}>
                <img src={c.image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105" />
                <div className="p-3">
                  <p className="text-sm font-semibold leading-tight">{c.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{counts[c.key] ? `${counts[c.key]} supplier${counts[c.key] > 1 ? "s" : ""}` : "Coming soon"}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 3. Filters + directory */}
        <section id="directory" aria-labelledby="dir-h" className="border-t border-border pt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 id="dir-h" className="text-lg font-semibold">Manufacturers</h2>
            {!isLoading && <span className="rounded-full bg-muted px-3 py-0.5 text-xs text-muted-foreground">{data.length} suppliers</span>}
          </div>
          <div className="sticky top-0 z-10 -mx-4 mt-3 flex flex-wrap items-center gap-2 bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
            <select aria-label="Packaging type" value={category} onChange={(e) => update("category", e.target.value)} className={selectCls}>
              <option value="">All packaging types</option>
              {PACKAGING_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            <select aria-label="Minimum order quantity" value={moq} onChange={(e) => update("moq", e.target.value)} className={selectCls}>
              {MOQ_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select aria-label="Customization" value={custom} onChange={(e) => update("custom", e.target.value)} className={selectCls}>
              {CUSTOM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select aria-label="Location" value={loc} onChange={(e) => update("state", e.target.value)} className={selectCls}>
              <option value="">Anywhere in India</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {hasFilters && <button type="button" onClick={clearAll} className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Clear all</button>}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <p aria-live="polite">
              {isLoading ? "Loading manufacturers…" : `${results.length} manufacturers found`}
            </p>
            <label className="flex items-center gap-1">Sort:
              <select aria-label="Sort manufacturers" value={sort} onChange={(e) => update("sort", e.target.value)} className="cursor-pointer bg-background py-1 text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="relevance">Relevance</option><option value="moq">Lowest MOQ</option><option value="name">Name (A–Z)</option><option value="location">Location</option>
              </select>
            </label>
          </div>
          <div aria-label="Manufacturer results" className="divide-y divide-border">
            {isLoading ? <><ManufacturerCardSkeleton /><ManufacturerCardSkeleton /></>
              : isError ? <div className="py-12 text-center"><p>We couldn't load manufacturers.</p><Button variant="outline" onClick={() => refetch()} className="mt-4 rounded-full">Retry</Button></div>
              : results.length ? results.map((m) => <ManufacturerCard key={m.id} m={m} selected={selected.includes(m.id)} onToggleSelect={() => toggle(m.id)} waText={waText} />)
              : <div className="py-12 text-center"><h3 className="text-lg font-semibold">No manufacturers match yet</h3><p className="mt-1 text-sm text-muted-foreground">Try clearing the filters, or share your requirement above and we'll find suppliers for you.</p><Button variant="outline" onClick={clearAll} className="mt-4 rounded-full">Clear filters</Button></div>}
          </div>
        </section>
      </main>

      {/* Sticky selection bar */}
      {selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-content flex-wrap items-center gap-2 px-4 py-3 md:px-6">
            <span className="text-sm font-semibold">{selected.length} selected</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">WhatsApp them your requirement — attach your photos in the chat.</span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {selectedMakers.map((m) => (
                <Button key={m.id} asChild size="sm" className="whatsapp-cta rounded-full px-4">
                  <a href={`https://wa.me/${waDigits(m.phone!)}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-1 h-3.5 w-3.5" />{m.name}</a>
                </Button>
              ))}
              <button type="button" onClick={() => setSelected([])} className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" />Clear</button>
            </div>
          </div>
        </div>
      )}
      <DirectoryFooter />
    </div>
  );
}
