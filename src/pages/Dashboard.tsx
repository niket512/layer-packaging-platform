import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, LayoutGrid, Heart, Scale, FileText, SlidersHorizontal, X } from "lucide-react";
import { getBrand, clearBrand } from "@/lib/brand-session";
import {
  compareStore,
  emptyFilters,
  filterProducts,
  productById,
  products,
  shortlistStore,
  sources,
  taxonomy,
  type Filters,
  type Product,
} from "@/lib/catalogue";
import FilterSidebar from "@/components/dashboard/FilterSidebar";
import ProductCard from "@/components/dashboard/ProductCard";
import ProductDialog from "@/components/dashboard/ProductDialog";
import CompareView from "@/components/dashboard/CompareView";
import SourcesView from "@/components/dashboard/SourcesView";
import logo from "@/assets/snaplogo-orange.png";
import { cn } from "@/lib/utils";

type View = "catalogue" | "shortlist" | "compare" | "sources";
const PAGE = 30;

export default function Dashboard() {
  const navigate = useNavigate();
  const brand = getBrand();

  const [view, setView] = useState<View>("catalogue");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [limit, setLimit] = useState(PAGE);
  const [saved, setSaved] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [detail, setDetail] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAllDesigns, setShowAllDesigns] = useState(false);

  useEffect(() => {
    if (!brand) navigate("/signin", { replace: true });
  }, [brand, navigate]);

  useEffect(() => {
    setSaved(shortlistStore.get());
    setCompare(compareStore.get());
  }, []);

  const set = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setLimit(PAGE);
  };

  const toggleSave = (id: string) => {
    const next = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id];
    setSaved(next);
    shortlistStore.set(next);
  };

  const toggleCompare = (id: string) => {
    const next = compare.includes(id) ? compare.filter((x) => x !== id) : [...compare, id].slice(0, 4);
    setCompare(next);
    compareStore.set(next);
  };

  const results = useMemo(() => filterProducts(filters), [filters]);
  const savedProducts = saved.map(productById).filter(Boolean) as Product[];
  const compareProducts = compare.map(productById).filter(Boolean) as Product[];

  const designFamilies = useMemo(
    () => taxonomy.filter((t) => !filters.group || t.group === filters.group),
    [filters.group],
  );
  const visibleDesigns = showAllDesigns ? designFamilies : designFamilies.slice(0, 6);

  const designImages = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of products) {
      if (p.design && p.image && !map[p.design]) map[p.design] = p.image;
    }
    return map;
  }, []);

  const activeChips = [
    filters.material && { label: filters.material, clear: () => set({ material: "" }) },
    filters.manufacturer && { label: filters.manufacturer, clear: () => set({ manufacturer: "" }) },
    filters.capacity && { label: `${filters.capacity} ml`, clear: () => set({ capacity: "" }) },
    filters.shoulder && { label: filters.shoulder, clear: () => set({ shoulder: "" }) },
    filters.feature && { label: filters.feature, clear: () => set({ feature: "" }) },
    filters.source && {
      label: sources.find((s) => s.key === filters.source)?.manufacturer ?? filters.source,
      clear: () => set({ source: "" }),
    },
    filters.reviewOnly && { label: "Needs confirmation", clear: () => set({ reviewOnly: false }) },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const navItems: { id: View; label: string; icon: typeof LayoutGrid; count?: number }[] = [
    { id: "catalogue", label: "Catalogue", icon: LayoutGrid },
    { id: "shortlist", label: "Shortlist", icon: Heart, count: saved.length },
    { id: "compare", label: "Compare", icon: Scale, count: compare.length },
    { id: "sources", label: "Sources", icon: FileText },
  ];

  const gridProducts = view === "shortlist" ? savedProducts : results.slice(0, limit);

  return (
    <div className="theme-dashboard min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Snaplogo" className="h-7 w-7 object-contain" />
            <span className="font-heading text-lg font-bold tracking-tight text-foreground">Snaplogo</span>
          </Link>
          <span className="hidden border-l border-border pl-3 text-[13px] text-muted-foreground sm:block">
            Packaging discovery
          </span>
        </div>

        <nav className="flex min-w-0 items-center gap-1.5 overflow-x-auto">
          {navItems.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                setView(n.id);
                setShowFilters(false);
              }}
              aria-pressed={view === n.id}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-3.5 text-[12.5px] font-semibold transition-colors",
                view === n.id
                  ? "border-primary bg-secondary text-primary"
                  : "border-border text-foreground hover:border-primary hover:text-primary",
              )}
            >
              <n.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{n.label}</span>
              {typeof n.count === "number" && <span className="opacity-70">{n.count}</span>}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-[13px] text-muted-foreground lg:block">{brand}</span>
          <button
            onClick={() => {
              clearBrand();
              navigate("/signin", { replace: true });
            }}
            className="inline-flex h-9 items-center rounded-xl border border-border px-4 text-[12px] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Sign out
          </button>
        </div>
      </header>

      {showFilters && view === "catalogue" && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <aside className="fixed right-0 top-0 z-50 h-full w-[min(92vw,340px)] overflow-y-auto border-l border-border bg-card p-5">
            <button
              onClick={() => setShowFilters(false)}
              className="ml-auto flex items-center gap-1 text-[13px] font-semibold text-primary"
            >
              Close <X className="h-4 w-4" />
            </button>
            <div className="mt-3">
              <FilterSidebar filters={filters} set={set} reset={() => setFilters(emptyFilters)} />
            </div>
          </aside>
        </>
      )}

      <div className="mx-auto flex w-full max-w-[1280px] gap-6 px-4 py-8 md:px-8">
        <main className="min-w-0 flex-1">
          {view === "compare" && (
            <CompareView
              items={compareProducts}
              onRemove={toggleCompare}
              onClear={() => {
                setCompare([]);
                compareStore.set([]);
              }}
            />
          )}

          {view === "sources" && <SourcesView />}

          {(view === "catalogue" || view === "shortlist") && (
            <>
              {view === "catalogue" ? (
                <section>
                  <p className="text-[11px] font-semibold uppercase tracking-[2.2px] text-muted-foreground">
                    {products.length} catalogue groups · {new Set(products.map((p) => p.manufacturer)).size}{" "}
                    manufacturers · {sources.length} pdfs
                  </p>
                  <h1 className="mt-3 font-heading text-[38px] font-semibold leading-[1.05] tracking-tight text-foreground md:text-[46px]">
                    Find the right pack.
                  </h1>
                  <p className="mt-3 text-[15px] text-muted-foreground">
                    Browse real supplier designs. Filter the details and save your favourites.
                  </p>

                  <div className="relative mt-6">
                    <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={filters.query}
                      onChange={(e) => set({ query: e.target.value })}
                      type="search"
                      aria-label="Search products"
                      placeholder="Search bottle names, product codes or features..."
                      className="h-16 w-full rounded-2xl border border-border bg-card pl-14 pr-5 text-[16px] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                    />
                  </div>

                  <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-heading text-[17px] font-medium text-foreground">Browse by design</h2>
                    <div className="flex items-center gap-2">
                      {[
                        { id: "Containers", label: "Containers" },
                        { id: "Components", label: "Components" },
                        { id: "", label: "All" },
                      ].map((g) => (
                        <button
                          key={g.label}
                          onClick={() => set({ group: g.id, designs: [] })}
                          aria-pressed={filters.group === g.id}
                          className={cn(
                            "h-8 rounded-full border px-3.5 text-[12px] font-semibold transition-colors",
                            filters.group === g.id
                              ? "border-primary bg-secondary text-primary"
                              : "border-border bg-card text-muted-foreground hover:border-primary",
                          )}
                        >
                          {g.label}
                        </button>
                      ))}
                      {designFamilies.length > 6 && (
                        <button
                          onClick={() => setShowAllDesigns((v) => !v)}
                          className="text-[14px] text-foreground hover:text-primary"
                        >
                          {showAllDesigns ? "Fewer families ↑" : "All design families ↓"}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleDesigns.map((d) => {
                      const on = filters.designs.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          title={d.definition}
                          onClick={() =>
                            set({
                              designs: on ? filters.designs.filter((x) => x !== d.id) : [...filters.designs, d.id],
                            })
                          }
                          className={cn(
                            "flex items-center gap-4 rounded-2xl border bg-card p-4 text-left transition-colors",
                            on ? "border-primary bg-secondary" : "border-border hover:border-primary/60",
                          )}
                        >
                          <span className="image-plate grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg">
                            {designImages[d.id] ? (
                              <img
                                src={designImages[d.id]}
                                alt=""
                                loading="lazy"
                                className="h-full w-full object-contain p-1.5"
                              />
                            ) : null}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[15px] text-foreground">{d.name}</span>
                            <span className="block text-[12px] text-muted-foreground">{d.count} designs</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : (
                <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[1.8px] text-primary">Saved for later</p>
                  <h1 className="mt-1 font-display text-[34px] leading-[1.1] text-foreground">Your shortlist</h1>
                  <p className="mt-1.5 text-[13px] text-muted-foreground">
                    {savedProducts.length} saved {savedProducts.length === 1 ? "product" : "products"} · stored in this
                    browser
                  </p>
                </section>
              )}

              {view === "catalogue" && activeChips.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeChips.map((c) => (
                    <button
                      key={c.label}
                      onClick={c.clear}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-[12px] text-foreground hover:border-primary"
                    >
                      {c.label} <X className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[15px] text-foreground" aria-live="polite">
                  {view === "catalogue"
                    ? `${results.length} matching catalogue groups`
                    : `${savedProducts.length} saved`}
                </p>
                <div className="flex items-center gap-3">
                  {view === "catalogue" && (
                    <>
                      <button
                        onClick={() => setShowFilters(true)}
                        className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-[14px] text-foreground transition-colors hover:border-primary"
                      >
                        <SlidersHorizontal className="h-4 w-4" /> Filters
                      </button>
                      <label className="flex items-center gap-2 text-[14px] text-muted-foreground">
                        Sort
                        <select
                          value={filters.sort}
                          onChange={(e) => set({ sort: e.target.value as Filters["sort"] })}
                          className="h-11 rounded-xl border border-border bg-card px-3 text-[14px] text-foreground outline-none focus:border-primary"
                        >
                          <option value="featured">Catalogue order</option>
                          <option value="name">Name A–Z</option>
                          <option value="capacity">Capacity ↑</option>
                          <option value="maker">Manufacturer</option>
                        </select>
                      </label>
                    </>
                  )}
                </div>
              </div>


              {gridProducts.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                  <p className="font-heading text-lg font-semibold text-foreground">No products match yet</p>
                  <p className="mt-2 text-[13px] text-muted-foreground">
                    {view === "shortlist" ? "Save products from the catalogue" : "Try clearing a filter or two"}
                  </p>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {gridProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      saved={saved.includes(p.id)}
                      compared={compare.includes(p.id)}
                      onToggleSave={() => toggleSave(p.id)}
                      onToggleCompare={() => toggleCompare(p.id)}
                      onOpen={() => setDetail(p)}
                    />
                  ))}
                </div>
              )}

              {view === "catalogue" && limit < results.length && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setLimit((l) => l + PAGE)}
                    className="inline-flex h-11 items-center rounded-full border border-border bg-background px-6 text-[13px] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    Show more products
                  </button>
                </div>
              )}
            </>
          )}

          <footer className="mt-10 flex flex-wrap justify-between gap-2 border-t border-border pt-4 text-[11px] text-muted-foreground">
            <span>Source-linked catalogue · design classifications are visual interpretations</span>
            <span>Shortlist saved in this browser</span>
          </footer>
        </main>
      </div>

      {compare.length > 0 && view !== "compare" && (
        <div className="fixed inset-x-0 bottom-4 z-30 mx-auto flex w-[min(92%,520px)] items-center justify-between gap-3 rounded-full border border-border bg-background px-4 py-3 shadow-lg">
          <span className="text-[13px] text-muted-foreground">{compare.length} selected to compare</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setCompare([]);
                compareStore.set([]);
              }}
              className="h-9 rounded-full border border-border px-4 text-[12px] font-semibold"
            >
              Clear
            </button>
            <button
              onClick={() => setView("compare")}
              className="h-9 rounded-full bg-primary px-4 text-[12px] font-semibold text-primary-foreground"
            >
              Compare
            </button>
          </div>
        </div>
      )}

      <ProductDialog product={detail} onOpenChange={(o) => !o && setDetail(null)} />
    </div>
  );
}
