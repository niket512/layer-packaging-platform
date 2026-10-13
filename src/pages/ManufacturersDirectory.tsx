import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Sparkles, Loader2, X, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { DirectoryFooter } from "@/components/directory/DirectoryChrome";
import { ManufacturerCard, ManufacturerCardSkeleton } from "@/components/directory/ManufacturerCard";
import { fetchPublishedManufacturers, categoryLabel, placeOf, PACKAGING_CATEGORIES, moqUnits, type DirectoryManufacturer } from "@/data/directory";

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

function RequirementForm() {
  const [brand, setBrand] = useState("");
  const [email, setEmail] = useState("");
  const [requirement, setRequirement] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    const { error } = await supabase.from("access_requests").insert({ brand: brand.trim(), email: email.trim(), requirement: `[Directory] ${requirement.trim()}` });
    setState(error ? "error" : "done");
  };
  if (state === "done") return <p className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary" /> Thanks — we'll share suitable suppliers by email shortly.</p>;
  return (
    <form onSubmit={submit} className="grid gap-2 sm:grid-cols-2">
      <input required value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand name" aria-label="Brand name" className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email" aria-label="Email" className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      <textarea required value={requirement} onChange={(e) => setRequirement(e.target.value)} placeholder="Product type, dimensions, quantity and customization" aria-label="Requirement" rows={3} className="rounded-lg border border-input bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:col-span-2" />
      <div className="flex items-center gap-3 sm:col-span-2">
        <Button type="submit" disabled={state === "sending"} className="rounded-full">{state === "sending" ? "Sending…" : "Share requirement"}</Button>
        {state === "error" && <span role="alert" className="text-sm text-destructive">Couldn't send — please try again.</span>}
      </div>
    </form>
  );
}

export default function ManufacturersDirectory() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const moq = params.get("moq") ?? "";
  const custom = params.get("custom") ?? "";
  const loc = params.get("state") ?? "";
  const sort = params.get("sort") ?? "relevance";
  const { data = [], isLoading, isError, refetch } = useQuery({ queryKey: ["directory"], queryFn: fetchPublishedManufacturers });
  const [ai, setAi] = useState<{ query: string; matches: { id: string; reason: string }[] } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  useEffect(() => {
    document.title = "Find packaging manufacturers in India | Snaplogo";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Discover packaging manufacturers by packaging type, order quantity, customization and location.");
  }, []);
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };
  const askAi = async () => {
    if (!q.trim() || !data.length) return;
    setAiLoading(true); setAiError("");
    const manufacturers = data.map((m) => ({ id: m.id, name: m.name, location: placeOf(m), description: m.description, categories: m.packaging_categories.map(categoryLabel), products: m.products, moq: m.minimum_order_quantities, lead_times: m.lead_times }));
    const { data: res, error } = await supabase.functions.invoke("directory-search", { body: { query: q, manufacturers } });
    setAiLoading(false);
    if (error || res?.error) { setAiError(res?.error ?? "AI search failed, please try again"); return; }
    setAi({ query: q, matches: res.matches ?? [] });
  };
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
    if (ai) return ai.matches.map((x) => data.find((m) => m.id === x.id)).filter((m): m is DirectoryManufacturer => !!m && passesFilters(m));
    const words = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const rows = data.filter((m) => {
      const text = [m.name, m.description, m.city, m.state, ...m.products, ...m.packaging_categories.map(categoryLabel)].join(" ").toLowerCase();
      return words.every((w) => text.includes(w)) && passesFilters(m);
    });
    if (sort === "name") rows.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "location") rows.sort((a, b) => placeOf(a).localeCompare(placeOf(b)));
    if (sort === "moq") rows.sort((a, b) => (moqUnits(a) ?? Infinity) - (moqUnits(b) ?? Infinity));
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, q, category, moq, custom, loc, sort, ai]);
  const reasonOf = (id: string) => ai?.matches.find((x) => x.id === id)?.reason;
  const hasFilters = !!(category || moq || custom || loc);
  const pickCategory = (key: string) => {
    update("category", category === key ? "" : key);
    document.getElementById("directory")?.scrollIntoView({ behavior: "smooth" });
  };
  const clearAll = () => { setAi(null); setParams(new URLSearchParams()); };

  return (
    <div className="theme-directory min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-content px-4 md:px-6">
        {/* 1. Search-first hero */}
        <section className="py-10 md:py-14">
          <p className="text-xs font-semibold uppercase tracking-[1.5px] text-primary">The D2C packaging network</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">Find the right packaging manufacturer.</h1>
          <p className="mt-2 max-w-xl text-base text-muted-foreground">Discover manufacturers by packaging type, order quantity, customization and location.</p>
          <form role="search" onSubmit={(e) => { e.preventDefault(); askAi(); }} className="relative mt-5">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => { setAi(null); update("q", e.target.value); }} aria-label="Search manufacturers" placeholder="Search boxes, pouches, bottles, labels… or describe your need" className="h-14 w-full rounded-lg border border-input bg-background pl-11 pr-32 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            <Button type="submit" size="sm" disabled={aiLoading || !q.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full">
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} AI match
            </Button>
          </form>
          {aiError && <p role="alert" className="mt-2 text-sm text-destructive">{aiError}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {[{ l: "Low MOQ", k: "moq", v: "500" }, { l: "Custom printing", k: "custom", v: "custom-printing" }, { l: "Custom sizes", k: "custom", v: "custom-sizes" }].map((t) => {
              const on = params.get(t.k) === t.v;
              return <button key={t.l} type="button" aria-pressed={on} onClick={() => update(t.k, on ? "" : t.v)} className={`h-7 rounded-full px-3 text-xs ${on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{t.l}</button>;
            })}
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
            {(hasFilters || ai) && <button type="button" onClick={clearAll} className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Clear all</button>}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <p aria-live="polite" className="flex items-center gap-2">
              {isLoading ? "Loading manufacturers…" : ai ? <><Sparkles className="h-4 w-4 text-primary" />{results.length} AI matches for “{ai.query}”<button type="button" onClick={() => setAi(null)} aria-label="Clear AI results" className="hover:text-foreground"><X className="h-4 w-4" /></button></> : `${results.length} manufacturers found`}
            </p>
            {!ai && <label className="flex items-center gap-1">Sort:
              <select aria-label="Sort manufacturers" value={sort} onChange={(e) => update("sort", e.target.value)} className="cursor-pointer bg-background py-1 text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="relevance">Relevance</option><option value="moq">Lowest MOQ</option><option value="name">Name (A–Z)</option><option value="location">Location</option>
              </select>
            </label>}
          </div>
          <div aria-label="Manufacturer results" className="divide-y divide-border">
            {isLoading ? <><ManufacturerCardSkeleton /><ManufacturerCardSkeleton /></>
              : isError ? <div className="py-12 text-center"><p>We couldn’t load manufacturers.</p><Button variant="outline" onClick={() => refetch()} className="mt-4 rounded-full">Retry</Button></div>
              : results.length ? results.map((m) => <div key={m.id}>{reasonOf(m.id) && <p className="pt-4 text-sm text-primary"><Sparkles className="mr-1 inline h-3.5 w-3.5" />{reasonOf(m.id)}</p>}<ManufacturerCard m={m} /></div>)
              : <div className="py-12 text-center"><h3 className="text-lg font-semibold">No manufacturers match yet</h3><p className="mt-1 text-sm text-muted-foreground">Share your requirement below and we'll find suppliers for you.</p><Button variant="outline" onClick={clearAll} className="mt-4 rounded-full">Clear filters</Button></div>}
          </div>
        </section>

        {/* 4. Requirement CTA */}
        <section id="request" aria-labelledby="req-h" className="my-10 grid gap-6 rounded-2xl border border-border bg-muted/40 p-6 md:grid-cols-[1fr_1.2fr] md:p-8">
          <div>
            <h2 id="req-h" className="text-xl font-semibold">Can't find the right manufacturer?</h2>
            <p className="mt-2 text-sm text-muted-foreground">Tell us what you need. We'll help identify suitable suppliers.</p>
            <ol className="mt-4 space-y-2 text-sm">
              {["Share your packaging requirement", "Get matched with suppliers", "Compare quotes on price, MOQ and timelines"].map((s, i) => <li key={s} className="flex gap-2"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">{i + 1}</span>{s}</li>)}
            </ol>
          </div>
          <RequirementForm />
        </section>
      </main>
      <DirectoryFooter />
    </div>
  );
}
