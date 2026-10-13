import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Sparkles, Loader2, X } from "lucide-react";
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
  const [ai, setAi] = useState<{ query: string; matches: { id: string; reason: string }[] } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const askAi = async () => {
    if (!q.trim() || !data.length) return;
    setAiLoading(true); setAiError("");
    const manufacturers = data.map((m) => ({ id: m.id, name: m.name, location: placeOf(m), description: m.description, categories: m.packaging_categories.map(categoryLabel), products: m.products, moq: m.minimum_order_quantities, lead_times: m.lead_times }));
    const { data: res, error } = await supabase.functions.invoke("directory-search", { body: { query: q, manufacturers } });
    setAiLoading(false);
    if (error || res?.error) { setAiError(res?.error ?? "AI search failed, please try again"); return; }
    setAi({ query: q, matches: res.matches ?? [] });
  };
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };
  const results = useMemo(() => {
    if (ai) return ai.matches.map((x) => data.find((m) => m.id === x.id)).filter(Boolean) as typeof data;
    const words = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const cats = category.split(",").filter(Boolean);
    const rows = data.filter((m) => {
      const text = [m.name, m.description, m.city, m.state, ...m.products, ...m.packaging_categories.map(categoryLabel)].join(" ").toLowerCase();
      return words.every((word) => text.includes(word)) && (!cats.length || m.packaging_categories.some((c) => cats.includes(c)));
    });
    if (sort === "name") rows.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "location") rows.sort((a, b) => placeOf(a).localeCompare(placeOf(b)));
    return rows;
  }, [data, q, category, sort, ai]);
  const reasonOf = (id: string) => ai?.matches.find((x) => x.id === id)?.reason;
  return (
    <div className="theme-directory min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-content px-4 py-6 md:px-6 md:py-8">
        <section className="border-b border-border pb-7">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold leading-tight">Packaging manufacturers</h1>
            {!isLoading && <span className="shrink-0 rounded-full bg-muted px-3 py-0.5 text-xs text-muted-foreground">{data.length} suppliers</span>}
          </div>
          <p className="mt-1 text-base text-muted-foreground">Find the right packaging partner for your brand.</p>
          <form role="search" onSubmit={(e) => { e.preventDefault(); askAi(); }} className="relative mt-4">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => { setAi(null); update("q", e.target.value); }} aria-label="Search manufacturers" placeholder="Describe what you need, e.g. 500 printed kraft bags in Delhi within 2 weeks" className="h-14 w-full rounded-lg border border-input bg-background pl-11 pr-32 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            <Button type="submit" size="sm" disabled={aiLoading || !q.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full">
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} AI match
            </Button>
          </form>
          {aiError && <p role="alert" className="mt-2 text-sm text-destructive">{aiError}</p>}
          {ai && <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Sparkles className="h-4 w-4 text-primary" /> AI matches for “{ai.query}”<button type="button" onClick={() => setAi(null)} aria-label="Clear AI results" className="hover:text-foreground"><X className="h-4 w-4" /></button></div>}
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
          {isLoading ? <><ManufacturerCardSkeleton /><ManufacturerCardSkeleton /></> : isError ? <div className="py-12 text-center"><p>We couldn’t load manufacturers.</p><Button variant="outline" onClick={() => refetch()} className="mt-4 rounded-full">Retry</Button></div> : results.length ? results.map((m) => <div key={m.id}>{reasonOf(m.id) && <p className="pt-4 text-sm text-primary"><Sparkles className="mr-1 inline h-3.5 w-3.5" />{reasonOf(m.id)}</p>}<ManufacturerCard m={m} /></div>) : <div className="py-12 text-center"><h2 className="text-lg font-semibold">No manufacturers found</h2><Button variant="outline" onClick={() => { setAi(null); setParams(new URLSearchParams()); }} className="mt-4 rounded-full">Clear filters</Button></div>}
        </section>
      </main>
      <DirectoryFooter />
    </div>
  );
}
