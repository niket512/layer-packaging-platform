import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DirectoryFooter, DirectoryHeader } from "@/components/directory/DirectoryChrome";
import { ManufacturerCard, ManufacturerCardSkeleton } from "@/components/directory/ManufacturerCard";
import {
  CAPABILITIES, CUSTOMIZATION, PACKAGING_CATEGORIES, type DirectoryManufacturer,
  categoryLabel, fetchPublishedManufacturers, placeOf,
} from "@/data/directory";
import { cn } from "@/lib/utils";

type Sort = "relevance" | "name" | "location";
const listParam = (p: URLSearchParams, k: string) => (p.get(k) ? p.get(k)!.split(",") : []);

function haystack(m: DirectoryManufacturer) {
  return [
    m.name, m.description, m.city, m.state, ...m.products,
    ...m.packaging_categories.map(categoryLabel),
    ...m.customization_capabilities.map((c) => CUSTOMIZATION[c]),
    ...m.printing_capabilities.map((c) => CAPABILITIES[c]),
  ].filter(Boolean).join(" ").toLowerCase();
}

function score(m: DirectoryManufacturer, q: string) {
  if (!q) return 0;
  const words = q.split(/\s+/).filter((w) => w.length > 2 && !["manufacturers", "manufacturer", "suppliers", "supplier"].includes(w));
  const h = haystack(m);
  return words.reduce((s, w) => s + (h.includes(w.replace(/s$/, "")) ? 1 : 0), 0);
}

export default function ManufacturersDirectory() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const cats = listParam(params, "category");
  const cust = listParam(params, "custom");
  const caps = listParam(params, "capability");
  const locs = listParam(params, "location");
  const sort = (params.get("sort") as Sort) ?? "relevance";
  const [heroQ, setHeroQ] = useState(q);
  const [locQ, setLocQ] = useState("");

  useEffect(() => {
    document.title = "Find packaging manufacturers in India | Snaplogo";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Discover packaging suppliers across India, compare capabilities and request quotes on Snaplogo.");
  }, []);

  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["directory"], queryFn: fetchPublishedManufacturers });
  const all = data ?? [];

  const update = (k: string, v: string | string[] | null) => {
    const next = new URLSearchParams(params);
    const val = Array.isArray(v) ? v.join(",") : v;
    if (val) next.set(k, val); else next.delete(k);
    setParams(next, { replace: true });
  };
  const toggle = (k: string, list: string[], v: string) => update(k, list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const clearAll = () => { setParams(new URLSearchParams(), { replace: true }); setHeroQ(""); };

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    const r = all
      .map((m) => ({ m, s: score(m, t) }))
      .filter(({ m, s }) =>
        (!t || s > 0 || haystack(m).includes(t)) &&
        (cats.length === 0 || cats.some((c) => m.packaging_categories.includes(c as never))) &&
        cust.every((c) => m.customization_capabilities.includes(c as never)) &&
        caps.every((c) => m.printing_capabilities.includes(c as never)) &&
        (locs.length === 0 || locs.includes(m.state ?? "")),
      );
    if (sort === "name") r.sort((a, b) => a.m.name.localeCompare(b.m.name));
    else if (sort === "location") r.sort((a, b) => placeOf(a.m).localeCompare(placeOf(b.m)));
    else r.sort((a, b) => b.s - a.s);
    return r.map((x) => x.m);
  }, [all, q, cats, cust, caps, locs, sort]);

  // Only offer options that real supplier data supports
  const usedCust = Object.keys(CUSTOMIZATION).filter((k) => all.some((m) => m.customization_capabilities.includes(k as never)));
  const usedCaps = Object.keys(CAPABILITIES).filter((k) => all.some((m) => m.printing_capabilities.includes(k as never)));
  const states = [...new Set(all.map((m) => m.state).filter(Boolean) as string[])].sort();
  const countFor = (k: string) => all.filter((m) => m.packaging_categories.includes(k as never)).length;

  const chips = [
    ...(q ? [{ label: `“${q}”`, clear: () => { update("q", null); setHeroQ(""); } }] : []),
    ...cats.map((c) => ({ label: categoryLabel(c as never), clear: () => toggle("category", cats, c) })),
    ...cust.map((c) => ({ label: CUSTOMIZATION[c as keyof typeof CUSTOMIZATION], clear: () => toggle("custom", cust, c) })),
    ...caps.map((c) => ({ label: CAPABILITIES[c as keyof typeof CAPABILITIES], clear: () => toggle("capability", caps, c) })),
    ...locs.map((c) => ({ label: c, clear: () => toggle("location", locs, c) })),
  ];

  const goDiscover = () => document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" });

  const filters = (
    <div className="space-y-7">
      <FilterGroup title="Packaging category">
        {PACKAGING_CATEGORIES.map((c) => (
          <Check key={c.key} label={c.label} count={countFor(c.key)} checked={cats.includes(c.key)} onChange={() => toggle("category", cats, c.key)} />
        ))}
      </FilterGroup>
      {usedCust.length > 0 && (
        <FilterGroup title="Customisation">
          {usedCust.map((k) => <Check key={k} label={CUSTOMIZATION[k as keyof typeof CUSTOMIZATION]} checked={cust.includes(k)} onChange={() => toggle("custom", cust, k)} />)}
        </FilterGroup>
      )}
      {states.length > 0 && (
        <FilterGroup title="Location">
          <input value={locQ} onChange={(e) => setLocQ(e.target.value)} placeholder="Search state or city" aria-label="Search location" className="mb-2 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm" />
          {states.filter((s) => {
            const t = locQ.toLowerCase();
            return !t || s.toLowerCase().includes(t) || all.some((m) => m.state === s && m.city?.toLowerCase().includes(t));
          }).map((s) => <Check key={s} label={s} checked={locs.includes(s)} onChange={() => toggle("location", locs, s)} />)}
        </FilterGroup>
      )}
      {usedCaps.length > 0 && (
        <FilterGroup title="Supplier capabilities">
          {usedCaps.map((k) => <Check key={k} label={CAPABILITIES[k as keyof typeof CAPABILITIES]} checked={caps.includes(k)} onChange={() => toggle("capability", caps, k)} />)}
        </FilterGroup>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <DirectoryHeader />
      <main>
        {/* Hero */}
        <section className="border-b border-border bg-muted/40">
          <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-6 md:py-20">
            <h1 className="max-w-[720px] font-heading text-4xl font-bold leading-tight text-foreground md:text-[52px]">
              Find the right packaging manufacturer for your brand.
            </h1>
            <p className="mt-4 max-w-[600px] text-lg leading-relaxed text-muted-foreground">
              Discover packaging suppliers across India, compare their capabilities, and connect with manufacturers who fit your requirements.
            </p>
            <form role="search" onSubmit={(e) => { e.preventDefault(); update("q", heroQ.trim() || null); goDiscover(); }} className="mt-8 flex max-w-[680px] items-center gap-2 rounded-full border border-border bg-background p-1.5 shadow-sm">
              <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
              <input value={heroQ} onChange={(e) => setHeroQ(e.target.value)} aria-label="Search manufacturers" placeholder="Search manufacturers, packaging types, or products..." className="h-11 min-w-0 flex-1 bg-transparent text-[15px] outline-none" />
              <button type="submit" className="h-11 rounded-full bg-primary px-6 text-xs font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90">Search</button>
            </form>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={goDiscover} className="h-12 rounded-full bg-foreground px-6 text-[13px] font-bold uppercase tracking-wide text-background hover:opacity-90">Explore Manufacturers</button>
              <a href="/app/store" className="inline-flex h-12 items-center rounded-full border border-border bg-background px-6 text-[13px] font-bold uppercase tracking-wide text-foreground hover:border-primary hover:text-primary">List Your Business</a>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section id="categories" className="mx-auto max-w-[1200px] scroll-mt-16 px-4 py-14 md:px-6">
          <h2 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">Explore by packaging type</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {PACKAGING_CATEGORIES.map((c) => {
              const n = countFor(c.key);
              return (
                <button key={c.key} onClick={() => { update("category", c.key); goDiscover(); }} className="group overflow-hidden rounded-2xl border border-border bg-card text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <img src={c.image} alt="" loading="lazy" width={944} height={704} className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                  <div className="p-4">
                    <h3 className="text-[15px] font-semibold text-foreground">{c.label}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{c.subtitle}</p>
                    {!isLoading && <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-primary">{n} supplier{n === 1 ? "" : "s"}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Discovery */}
        <section id="discover" className="scroll-mt-14 border-t border-border bg-muted/40">
          <div className="mx-auto max-w-[1200px] px-4 py-14 md:px-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">Discover packaging manufacturers</h2>
            <p className="mt-2 text-muted-foreground">Explore supplier capabilities and find the right fit for your packaging requirements.</p>

            <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
              <aside aria-label="Filters" className="hidden lg:block">{filters}</aside>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[200px] flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={q} onChange={(e) => { update("q", e.target.value || null); setHeroQ(e.target.value); }} aria-label="Search within results" placeholder="Search within results" className="h-10 w-full rounded-full border border-input bg-background pl-9 pr-3 text-sm" />
                  </div>
                  <Sheet>
                    <SheetTrigger className="inline-flex h-10 items-center gap-2 rounded-full border border-input bg-background px-4 text-sm lg:hidden">
                      <SlidersHorizontal className="h-4 w-4" /> Filters
                    </SheetTrigger>
                    <SheetContent side="left" className="overflow-y-auto">
                      <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                      <div className="mt-6">{filters}</div>
                    </SheetContent>
                  </Sheet>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    Sort
                    <select value={sort} onChange={(e) => update("sort", e.target.value === "relevance" ? null : e.target.value)} className="h-10 rounded-full border border-input bg-background px-3 text-sm text-foreground">
                      <option value="relevance">Relevance</option>
                      <option value="name">Name (A–Z)</option>
                      <option value="location">Location</option>
                    </select>
                  </label>
                </div>

                {chips.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {chips.map((c) => (
                      <button key={c.label} onClick={c.clear} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
                        {c.label} <X className="h-3 w-3" aria-label="Remove" />
                      </button>
                    ))}
                    <button onClick={clearAll} className="text-xs font-semibold text-muted-foreground underline hover:text-foreground">Clear all</button>
                  </div>
                )}

                {!isLoading && !isError && <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">{results.length} manufacturer{results.length === 1 ? "" : "s"}</p>}

                <div className="mt-4">
                  {isLoading ? (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <ManufacturerCardSkeleton key={i} />)}</div>
                  ) : isError ? (
                    <State title="We couldn’t load manufacturers" body="Something went wrong while loading the directory. Please try again." action="Retry" onAction={() => refetch()} />
                  ) : results.length === 0 ? (
                    <State title="No manufacturers found" body="Try a different packaging category, location, or search term." action="Clear filters" onAction={clearAll} />
                  ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{results.map((m) => <ManufacturerCard key={m.id} m={m} />)}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Supplier acquisition */}
        <section className="mx-auto max-w-[1200px] px-4 py-16 md:px-6">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-card p-8 md:flex-row md:items-center md:p-10">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-foreground">Are you a packaging manufacturer?</h2>
              <p className="mt-2 text-muted-foreground">Get discovered by D2C and FMCG brands looking for packaging partners.</p>
            </div>
            <a href="/app/store" className="inline-flex h-12 shrink-0 items-center rounded-full bg-primary px-6 text-[13px] font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90">List Your Business</a>
          </div>
        </section>
      </main>
      <DirectoryFooter />
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-xs font-semibold uppercase tracking-[1.5px] text-muted-foreground">{title}</legend>
      <div className="space-y-2">{children}</div>
    </fieldset>
  );
}

function Check({ label, checked, onChange, count }: { label: string; checked: boolean; onChange: () => void; count?: number }) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-2.5 text-sm", count === 0 && !checked ? "text-muted-foreground/60" : "text-foreground")}>
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-[hsl(var(--primary))]" />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-muted-foreground">{count}</span>}
    </label>
  );
}

function State({ title, body, action, onAction }: { title: string; body: string; action: string; onAction: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-background p-12 text-center">
      <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <button onClick={onAction} className="mt-5 rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-primary-foreground">{action}</button>
    </div>
  );
}
