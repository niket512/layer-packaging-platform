import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, LayoutGrid, Heart, SlidersHorizontal, X, Package } from "lucide-react";
import { getBrand, clearBrand } from "@/lib/brand-session";
import {
  designName,
  emptyFilters,
  filterProducts,
  productById,
  products,
  shortlistStore,
  taxonomy,
  thumbUrl,
  type Filters,
  type Product,
} from "@/lib/catalogue";
import FilterSidebar from "@/components/dashboard/FilterSidebar";
import ProductCard from "@/components/dashboard/ProductCard";
import ProductDialog from "@/components/dashboard/ProductDialog";
import SachetCatalogue from "@/components/dashboard/SachetCatalogue";
import ManufacturersView from "@/components/dashboard/ManufacturersView";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import logo from "@/assets/snaplogo-orange.png";
import { cn } from "@/lib/utils";

type View = "catalogue" | "catalogue-makers" | "sachets" | "sachets-makers" | "shortlist";

const PAGE = 24;

export default function Dashboard() {
  const navigate = useNavigate();
  const brand = getBrand();

  const [view, setView] = useState<View>("catalogue");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [page, setPage] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);
  
  const [detail, setDetail] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [shapeGrid, setShapeGrid] = useState(false);

  useEffect(() => {
    if (!brand) navigate("/signin", { replace: true });
  }, [brand, navigate]);

  useEffect(() => {
    setSaved(shortlistStore.get());
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




  const toggleDesign = (id: string) =>
    set({ designs: filters.designs.includes(id) ? filters.designs.filter((x) => x !== id) : [...filters.designs, id] });

  const results = useMemo(() => filterProducts(filters), [filters]);
  const savedProducts = saved.map(productById).filter(Boolean) as Product[];
  

  const designFamilies = useMemo(
    () =>
      taxonomy.filter(
        (t) => (!filters.group || t.group === filters.group) && t.id !== "unknown-body",
      ),
    [filters.group],
  );

  // Consistent counting: every count below is a number of products
  const designCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of products) map[p.design] = (map[p.design] ?? 0) + 1;
    return map;
  }, []);

  const designImages = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of products) {
      if (p.design && p.image && !map[p.design]) map[p.design] = thumbUrl(p.image);
    }
    return map;
  }, []);

  const shapeStrip = useMemo(
    () =>
      [...designFamilies]
        .sort((a, b) => (designCounts[b.id] ?? 0) - (designCounts[a.id] ?? 0))
        .slice(0, 8),
    [designFamilies, designCounts],
  );

  const activeChips = [
    ...filters.designs.map((d) => ({ label: `Shape: ${designName(d)}`, clear: () => toggleDesign(d) })),
    filters.capacity && {
      label: `Capacity: ${Number(filters.capacity).toLocaleString()} ml`,
      clear: () => set({ capacity: "" }),
    },
    filters.closure && { label: `Closure: ${filters.closure}`, clear: () => set({ closure: "" }) },
    filters.feature && { label: `Body: ${filters.feature}`, clear: () => set({ feature: "" }) },
    filters.shoulder && { label: `Shoulder: ${filters.shoulder}`, clear: () => set({ shoulder: "" }) },
    filters.query.trim() && { label: `Search: ${filters.query.trim()}`, clear: () => set({ query: "" }) },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const navItems: {
    id: View;
    label: string;
    icon: typeof LayoutGrid;
    count?: number;
    children?: { id: View; label: string }[];
  }[] = [
    {
      id: "catalogue",
      label: "Bottles & jars",
      icon: LayoutGrid,
      children: [
        { id: "catalogue", label: "Catalogue" },
        { id: "catalogue-makers", label: "Manufacturing profiles" },
      ],
    },
    {
      id: "sachets",
      label: "Sachets & pouches",
      icon: Package,
      children: [
        { id: "sachets", label: "Catalogue" },
        { id: "sachets-makers", label: "Manufacturing profiles" },
      ],
    },
    { id: "shortlist", label: "Shortlist", icon: Heart, count: saved.length },
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
        {navItems.map((n) => {
          const sectionActive = n.children ? n.children.some((c) => c.id === view) : view === n.id;
          return (
            <div key={n.id}>
              <button
                onClick={() => {
                  setView(n.id);
                  setShowFilters(false);
                }}
                aria-pressed={sectionActive}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] transition-colors",
                  sectionActive
                    ? "bg-secondary font-semibold text-primary"
                    : "text-foreground hover:bg-secondary/60",
                )}
              >
                <n.icon className="h-4 w-4" />
                <span className="truncate">{n.label}</span>
                {typeof n.count === "number" && n.count > 0 && (
                  <span className="ml-auto grid h-5 min-w-[20px] place-items-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                    {n.count}
                  </span>
                )}
              </button>

              {n.children && sectionActive && (
                <div className="ml-[26px] mt-1 grid gap-0.5 border-l border-border pl-3">
                  {n.children.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setView(c.id);
                        setShowFilters(false);
                      }}
                      aria-pressed={view === c.id}
                      className={cn(
                        "rounded-md px-2.5 py-1.5 text-left text-[12.5px] transition-colors",
                        view === c.id
                          ? "font-semibold text-primary"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {view === "catalogue" && (
        <div className="mt-7">
          <FilterSidebar filters={filters} set={set} reset={() => setFilters(emptyFilters)} />
        </div>
      )}
    </>
  );

  const shapeTile = (d: (typeof taxonomy)[number], compact: boolean) => {
    const on = filters.designs.includes(d.id);
    return (
      <button
        key={d.id}
        title={d.definition}
        onClick={() => toggleDesign(d.id)}
        aria-pressed={on}
        className={cn(
          "flex flex-col items-center gap-1 rounded-lg border bg-card px-2 py-2 text-center transition-colors",
          compact ? "min-w-[92px]" : "",
          on
            ? "border-primary bg-secondary ring-1 ring-inset ring-primary"
            : "border-border hover:border-primary/50",
        )}
      >
        <span
          className={cn(
            "image-plate grid place-items-center overflow-hidden rounded",
            compact ? "h-[44px] w-[42px]" : "h-[70px] w-[66px]",
          )}
        >
          {designImages[d.id] && (
            <img
              src={designImages[d.id]}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain p-1"
            />
          )}
        </span>
        <span className="line-clamp-2 text-[11px] leading-[1.25] text-foreground">{d.name}</span>
        <span className="text-[10px] text-muted-foreground">{designCounts[d.id] ?? 0} products</span>
      </button>
    );
  };

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
          {view === "catalogue" && (
            <button
              onClick={() => setShowFilters(true)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-[12.5px] text-foreground lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
              {activeChips.length > 0 && (
                <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                  {activeChips.length}
                </span>
              )}
            </button>
          )}
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

        <main className="min-w-0 px-5 pb-24 pt-7 md:px-8">
          {view === "sachets" && <SachetCatalogue />}
          {view === "catalogue-makers" && <ManufacturersView category="bottles" />}
          {view === "sachets-makers" && <ManufacturersView category="sachets" />}




          {(view === "catalogue" || view === "shortlist") && (
            <>
              {view === "catalogue" ? (
                <section>
                  <h1 className="font-heading text-[34px] font-semibold leading-[1.12] tracking-tight text-foreground md:text-[38px]">
                    Find the right pack
                  </h1>
                  <p className="mt-2 max-w-[530px] text-[14px] text-muted-foreground">
                    Browse real supplier designs, filter the details and save a shortlist you can share
                  </p>

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

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[1.2px] text-muted-foreground">
                      Browse by shape
                    </span>
                    <button
                      onClick={() => setShapeGrid(true)}
                      className="rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] text-foreground hover:border-primary/50"
                    >
                      View all {designFamilies.length} shapes
                    </button>
                  </div>

                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    {shapeStrip.map((d) => shapeTile(d, true))}
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
                <div className="mt-5 flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-card p-3">
                  <span className="mr-1 text-[11px] font-semibold uppercase tracking-[1.2px] text-muted-foreground">
                    Active filters
                  </span>
                  {activeChips.map((c) => (
                    <button
                      key={c.label}
                      onClick={c.clear}
                      aria-label={`Remove filter ${c.label}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11.5px] text-secondary-foreground transition-colors hover:text-primary"
                    >
                      {c.label} <X className="h-3 w-3" />
                    </button>
                  ))}
                  <button
                    onClick={() => setFilters(emptyFilters)}
                    className="ml-1 text-[11.5px] font-semibold text-primary hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[13px] text-muted-foreground" aria-live="polite">
                  {view === "catalogue" ? (
                    <>
                      <strong className="font-semibold text-foreground">{results.length}</strong>{" "}
                      {results.length === 1 ? "product" : "products"}
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
                      onToggleSave={() => toggleSave(p.id)}
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

      <Dialog open={shapeGrid} onOpenChange={setShapeGrid}>
        <DialogContent className="theme-dashboard max-h-[85vh] max-w-3xl overflow-y-auto bg-card">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-foreground">Browse all shapes</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
            {designFamilies.map((d) => shapeTile(d, false))}
          </div>
        </DialogContent>
      </Dialog>

      <ProductDialog
        product={detail}
        onOpenChange={(o) => !o && setDetail(null)}
        saved={detail ? saved.includes(detail.id) : false}
        onToggleSave={() => detail && toggleSave(detail.id)}
      />

    </div>
  );
}
