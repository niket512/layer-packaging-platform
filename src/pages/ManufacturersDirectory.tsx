import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DirectoryFooter } from "@/components/directory/DirectoryChrome";
import { ManufacturerCard, ManufacturerCardSkeleton } from "@/components/directory/ManufacturerCard";
import { fetchPublishedManufacturers, categoryLabel, placeOf } from "@/data/directory";

const groups = [
  { label: "All packaging", value: "" },
  { label: "Pouches & sachets", value: "flexible" },
  { label: "Boxes & cartons", value: "corrugated,cartons" },
  { label: "Bags & mailers", value: "paper-bags,courier" },
];

export default function ManufacturersDirectory() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const sort = params.get("sort") ?? "relevance";
  const { data = [], isLoading, isError, refetch } = useQuery({ queryKey: ["directory"], queryFn: fetchPublishedManufacturers });
  useEffect(() => {
    document.title = "Packaging manufacturers | Snaplogo";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Find packaging manufacturers across India. Explore packaging types, minimum orders and supplier profiles.");
  }, []);
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };
  const results = useMemo(() => {
    const words = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const cats = category.split(",").filter(Boolean);
    const rows = data.filter((m) => {
      const text = [m.name, m.description, m.city, m.state, ...m.products, ...m.packaging_categories.map(categoryLabel)].join(" ").toLowerCase();
      return words.every((word) => text.includes(word)) && (!cats.length || m.packaging_categories.some((c) => cats.includes(c)));
    });
    if (sort === "name") rows.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "location") rows.sort((a, b) => placeOf(a).localeCompare(placeOf(b)));
    return rows;
  }, [data, q, category, sort]);
  return (
    <div className="theme-directory min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-content px-4 py-6 md:px-6 md:py-8">
        <section className="border-b border-border pb-7">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold leading-tight">Packaging manufacturers</h1>
            {!isLoading && <span className="shrink-0 rounded-full bg-muted px-3 py-0.5 text-xs text-muted-foreground">{data.length} suppliers</span>}
          </div>
          <p className="mt-1 text-base text-muted-foreground">Find the right packaging partner for your brand.</p>
          <div role="search" className="relative mt-4">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => update("q", e.target.value)} aria-label="Search manufacturers" placeholder="Search suppliers, packaging types..." className="h-14 w-full rounded-lg border border-input bg-background pl-11 pr-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div aria-label="Packaging categories" className="mt-4 flex flex-wrap gap-2">
            {groups.map((g) => <Button key={g.label} variant="ghost" size="sm" aria-pressed={category === g.value} onClick={() => update("category", g.value)} className={`h-7 rounded-full px-3 text-xs ${category === g.value ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>{g.label}</Button>)}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <p aria-live="polite">{isLoading ? "Loading manufacturers…" : `${results.length} manufacturers found`}</p>
            <label className="flex items-center gap-1">Sort:
              <select aria-label="Sort manufacturers" value={sort} onChange={(e) => update("sort", e.target.value)} className="max-w-40 cursor-pointer bg-background py-1 text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="relevance">Relevance</option><option value="name">Name (A–Z)</option><option value="location">Location</option>
              </select>
            </label>
          </div>
        </section>
        <section aria-label="Manufacturers" className="divide-y divide-border">
          {isLoading ? <><ManufacturerCardSkeleton /><ManufacturerCardSkeleton /></> : isError ? <div className="py-12 text-center"><p>We couldn’t load manufacturers.</p><Button variant="outline" onClick={() => refetch()} className="mt-4 rounded-full">Retry</Button></div> : results.length ? results.map((m) => <ManufacturerCard key={m.id} m={m} />) : <div className="py-12 text-center"><h2 className="text-lg font-semibold">No manufacturers found</h2><Button variant="outline" onClick={() => setParams(new URLSearchParams())} className="mt-4 rounded-full">Clear filters</Button></div>}
        </section>
      </main>
      <DirectoryFooter />
    </div>
  );
}
