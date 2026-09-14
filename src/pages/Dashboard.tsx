import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, LayoutGrid, Heart, Scale, SlidersHorizontal, X } from "lucide-react";
import { getBrand, clearBrand } from "@/lib/brand-session";
import {
  compareStore,
  emptyFilters,
  filterProducts,
  productById,
  products,
  shortlistStore,
  taxonomy,
  type Filters,
  type Product,
} from "@/lib/catalogue";
import FilterSidebar from "@/components/dashboard/FilterSidebar";
import ProductCard from "@/components/dashboard/ProductCard";
import ProductDialog from "@/components/dashboard/ProductDialog";
import CompareView from "@/components/dashboard/CompareView";
import logo from "@/assets/snaplogo-orange.png";
import { cn } from "@/lib/utils";

type View = "catalogue" | "shortlist" | "compare";
const PAGE = 24;

export default function Dashboard() {
  const navigate = useNavigate();
  const brand = getBrand();

  const [view, setView] = useState<View>("catalogue");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [page, setPage] = useState(0);
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
    setPage(0);
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
    filters.capacity && { label: `${filters.capacity} ml`, clear: () => set({ capacity: "" }) },
    filters.shoulder && { label: filters.shoulder, clear: () => set({ shoulder: "" }) },
    filters.feature && { label: filters.feature, clear: () => set({ feature: "" }) },
    filters.reviewOnly && { label: "Needs confirmation", clear: () => set({ reviewOnly: false }) },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const navItems: { id: View; label: string; icon: typeof LayoutGrid; count?: number }[] = [
    { id: "catalogue", label: "Explore catalogue", icon: LayoutGrid },
    { id: "shortlist", label: "Shortlist", icon: Heart, count: saved.length },
    { id: "compare", label: "Compare", icon: Scale, count: compare.length },
  ];

  const start = page * PAGE;
  const gridProducts = view === "shortlist" ? savedProducts : results.slice(start, start + PAGE);
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE));

  const goPage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const rail = (
    <>
      <nav className="grid gap-1">
        {navItems.map((n) => (
          <button
            key={n.id}
            onClick={() => {
              setView(n.id);
              setShowFilters(false);
            }}
            aria-pressed={view === n.id}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] transition-colors",
              view === n.id
                ? "bg-secondary font-semibold text-primary"
                : "text-foreground hover:bg-secondary/60",
            )}
          >
            <n.icon className="h-4 w-4" />
            <span className="truncate">{n.label}</span>
            {typeof n.count === "number" && n.count > 0 && (
              <span className="ml-auto text-[12px] text-muted-foreground">{n.count}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-7">
        <FilterSidebar filters={filters} set={set} reset={() => setFilters(emptyFilters)} />
      </div>
    </>
  );

  return (
    <div className="theme-dashboard min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-5 border-b border-border bg-card px-5 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="Snaplogo" className="h-7 w-7 object-contain" />
            <span className="font-heading text-[22px] font-bold tracking-tight text-foreground">Snaplogo</span>
          </Link>
          <span className="hidden border-l border-border pl-4 text-[13px] text-muted-foreground sm:block">
            Packaging discovery
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={() => setShowFilters(true)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-[12.5px] text-foreground lg:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Menu
          </button>
          <span className="hidden text-[13px] text-muted-foreground sm:block">{brand}</span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-[12px] font-bold uppercase text-primary">
            {(brand ?? "?").slice(0, 2)}
          </span>
          <button
            onClick={() => {
              clearBrand();
              navigate("/signin", { replace: true });
            }}
            className="inline-flex h-9 items-center rounded-lg border border-border px-3.5 text-[12.5px] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Sign out
          </button>
        </div>
      </header>

      {showFilters && (
        <>
          <div className="fixed inset-0 z-40 bg-foreground/30 lg:hidden" onClick={() => setShowFilters(false)} />
          <aside className="fixed right-0 top-0 z-50 h-full w-[min(92vw,320px)] overflow-y-auto border-l border-border bg-card p-5 lg:hidden">
            <button
              onClick={() => setShowFilters(false)}
              className="ml-auto flex items-center gap-1 text-[13px] font-semibold text-primary"
            >
              Close <X className="h-4 w-4" />
            </button>
            <div className="mt-3">{rail}</div>
          </aside>
        </>
      )}

      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[242px_minmax(0,1fr)]">
        <aside className="hidden border-r border-border bg-surface-raised px-5 py-6 lg:block">
          <div className="sticky top-[88px]">{rail}</div>
        </aside>

        <main className="min-w-0 px-5 py-7 md:px-8">
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

          {(view === "catalogue" || view === "shortlist") && (
            <>
              {view === "catalogue" ? (
                <section>
                  <div className="flex flex-wrap items-end justify-between gap-6">
                    <div className="min-w-0">
                      <h1 className="font-heading text-[34px] font-semibold leading-[1.12] tracking-tight text-foreground md:text-[38px]">
                        Find the right pack
                      </h1>
                      <p className="mt-2 max-w-[530px] text-[14px] text-muted-foreground">
                        Browse real supplier designs, filter the details and save a shortlist you can share
                      </p>
                    </div>
                  </div>

                  <div className="relative mt-5">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={filters.query}
                      onChange={(e) => set({ query: e.target.value })}
                      type="search"
                      aria-label="Search products"
                      placeholder="Search bottle names, product codes or features..."
                      className="h-[50px] w-full rounded-[10px] border border-border bg-card pl-11 pr-4 text-[14px] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: "Containers", label: "Containers" },
                        { id: "Components", label: "Components" },
                        { id: "", label: "All products" },
                      ].map((g) => (
                        <button
                          key={g.label}
                          onClick={() => set({ group: g.id, designs: [] })}
                          aria-pressed={filters.group === g.id}
                          className={cn(
                            "h-8 rounded-lg border px-3 text-[12px] font-medium transition-colors",
                            filters.group === g.id
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-transparent text-foreground hover:border-primary/50",
                          )}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                    {designFamilies.length > 6 && (
                      <button
                        onClick={() => setShowAllDesigns((v) => !v)}
                        className="rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] text-foreground hover:border-primary/50"
                      >
                        {showAllDesigns ? "Fewer families ↑" : `All ${designFamilies.length} design families ↓`}
                      </button>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
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
                            "flex min-h-[132px] flex-col items-center gap-1.5 rounded-lg border bg-card px-1.5 py-2.5 text-center transition-colors",
                            on ? "border-primary ring-1 ring-inset ring-primary" : "border-border hover:border-primary/50",
                          )}
                        >
                          <span className="image-plate grid h-[68px] w-[65px] place-items-center overflow-hidden rounded">
                            {designImages[d.id] ? (
                              <img
                                src={designImages[d.id]}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-contain p-1"
                              />
                            ) : null}
                          </span>
                          <span className="text-[11px] leading-[1.3] text-foreground">{d.name}</span>
                          <span className="text-[10px] text-muted-foreground">{d.count} groups</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : (
                <section>
                  <h1 className="font-heading text-[30px] font-semibold tracking-tight text-foreground">
                    Your shortlist
                  </h1>
                  <p className="mt-1.5 text-[13px] text-muted-foreground">
                    {savedProducts.length} saved {savedProducts.length === 1 ? "product" : "products"} · stored in this
                    browser
                  </p>
                </section>
              )}

              {view === "catalogue" && activeChips.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {activeChips.map((c) => (
                    <button
                      key={c.label}
                      onClick={c.clear}
                      className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] text-secondary-foreground hover:text-primary"
                    >
                      {c.label} <X className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[13px] text-muted-foreground" aria-live="polite">
                  {view === "catalogue" ? (
                    <>
                      <strong className="font-semibold text-foreground">{results.length}</strong> matching catalogue
                      groups
                    </>
                  ) : (
                    `${savedProducts.length} saved`
                  )}
                </p>
                {view === "catalogue" && (
                  <label className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                    Sort
                    <select
                      value={filters.sort}
                      onChange={(e) => set({ sort: e.target.value as Filters["sort"] })}
                      className="h-9 rounded-lg border border-border bg-card px-2.5 text-[12px] text-foreground outline-none focus:border-primary"
                    >
                      <option value="featured">Catalogue order</option>
                      <option value="name">Name A–Z</option>
                      <option value="capacity">Capacity ↑</option>
                      <option value="maker">Manufacturer</option>
                    </select>
                  </label>
                )}
              </div>

              {gridProducts.length === 0 ? (
                <div className="mt-3 rounded-xl border border-dashed border-border bg-card p-11 text-center">
                  <h3 className="font-heading text-[19px] font-semibold text-foreground">No products match yet</h3>
                  <p className="mt-2 text-[13px] text-muted-foreground">
                    {view === "shortlist" ? "Save products from the catalogue" : "Try clearing a filter or two"}
                  </p>
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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

              {view === "catalogue" && results.length > PAGE && (
                <div className="mt-6 flex items-center justify-between gap-3 text-[12.5px]">
                  <button
                    onClick={() => goPage(page - 1)}
                    disabled={page === 0}
                    className="h-9 rounded-lg border border-border bg-card px-3.5 font-semibold text-foreground transition-colors hover:border-primary disabled:opacity-45"
                  >
                    ← Previous
                  </button>
                  <span className="text-muted-foreground">
                    {start + 1}–{Math.min(start + PAGE, results.length)} of {results.length}
                  </span>
                  <button
                    onClick={() => goPage(page + 1)}
                    disabled={page >= totalPages - 1}
                    className="h-9 rounded-lg border border-border bg-card px-3.5 font-semibold text-foreground transition-colors hover:border-primary disabled:opacity-45"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}

          <footer className="mt-8 flex flex-wrap justify-between gap-4 border-t border-border pt-4 text-[11px] text-muted-foreground">
            <span>Source-linked catalogue · design classifications are visual interpretations</span>
            <span>Shortlist saved in this browser</span>
          </footer>
        </main>
      </div>

      {compare.length > 0 && view !== "compare" && (
        <div className="fixed inset-x-0 bottom-4 z-30 mx-auto flex w-[min(92%,540px)] items-center justify-between gap-3 rounded-[10px] bg-foreground px-4 py-3 text-background shadow-lg">
          <span className="text-[12.5px]">{compare.length} selected to compare</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCompare([]);
                compareStore.set([]);
              }}
              className="text-[12px] underline"
            >
              Clear
            </button>
            <button
              onClick={() => setView("compare")}
              className="rounded-lg bg-[hsl(78_75%_76%)] px-3 py-1.5 text-[12px] font-semibold text-foreground"
            >
              Compare selected →
            </button>
          </div>
        </div>
      )}

      <ProductDialog product={detail} onOpenChange={(o) => !o && setDetail(null)} />
    </div>
  );
}
