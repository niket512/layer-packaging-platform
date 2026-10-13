import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, Check, MessageCircle, X } from "lucide-react";
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
  const clearAll = () => { setParams(new URLSearchParams()); };
  const waText = `Hi, I found you on Snaplogo.${contact.trim() ? ` I'm ${contact.trim()}.` : ""} My packaging requirement: ${reqText.trim() || "(please share details)"}`;
  const selectedMakers = data.filter((m) => selected.includes(m.id) && m.phone);
  const reachable = results.filter((m) => m.phone);
  const allShownSelected = reachable.length > 0 && reachable.every((m) => selected.includes(m.id));
  const addAllShown = () => setSelected((p) => allShownSelected ? p.filter((id) => !reachable.some((m) => m.id === id)) : [...new Set([...p, ...reachable.map((m) => m.id)])]);
  const needsText = !reqText.trim();
  const sendToSelected = () => {
    if (needsText) { document.getElementById("req")?.focus(); return; }
    selectedMakers.forEach((m, i) => {
      window.setTimeout(() => window.open(`https://wa.me/${waDigits(m.phone ?? "")}?text=${encodeURIComponent(waText)}`, "_blank", "noopener"), i * 350);
    });
  };

  return (
    <div className="theme-directory min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-[1000px] px-4 pb-8 md:px-6">
        <header className="flex items-center justify-between border-b border-border py-4">
          <a href="/manufacturers" className="text-lg font-bold">snaplogo<span className="text-primary">.</span></a>
          <span className="text-xs text-muted-foreground">Packaging network · India</span>
        </header>
        <section className="py-7 md:py-9">
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">Find your packaging manufacturer.</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your requirement. Your shortlist. A direct conversation.</p>
          <ol aria-label="Contact progress" className="mt-6 flex items-center gap-3 text-xs sm:gap-5 sm:text-sm">
            <li className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">{reqText.trim() ? <Check className="h-3.5 w-3.5" /> : "1"}</span>Requirement</li>
            <li aria-hidden="true" className="h-px w-5 bg-border sm:w-10" />
            <li className={`flex items-center gap-2 ${selected.length ? "text-foreground" : "text-muted-foreground"}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full ${selected.length ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{selected.length ? <Check className="h-3.5 w-3.5" /> : "2"}</span>Select makers</li>
            <li aria-hidden="true" className="h-px w-5 bg-border sm:w-10" />
            <li className="flex items-center gap-2 text-muted-foreground"><MessageCircle className="h-4 w-4" />WhatsApp</li>
          </ol>
          <div className="mt-6">
            <RequirementForm contact={contact} onContact={setContact} text={reqText} onText={setReqText} />
          </div>
          <div className="mt-4 flex justify-end">
            <Button asChild variant={reqText.trim() ? "default" : "outline"} size="sm" className="rounded-full"><a href="#directory">Choose manufacturers <ArrowDown /></a></Button>
          </div>
        </section>

        {/* 2. Pick makers */}
        <section id="directory" aria-labelledby="dir-h" className="border-t border-border pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="dir-h" className="flex items-center gap-2 text-lg font-semibold">
              Manufacturers
            </h2>
            {reachable.length > 0 && (
              <Button variant="outline" size="sm" onClick={addAllShown} className="h-8 rounded-full text-xs">
                {allShownSelected ? "Unselect all shown" : `Select all (${reachable.length})`}
              </Button>
            )}
          </div>
          <div className="sticky top-0 z-10 -mx-4 mt-3 space-y-2 bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
            <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Packaging type">
              <Button variant="outline" type="button" onClick={() => update("category", "")} aria-pressed={!category} className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${!category ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-muted-foreground"}`}>All · {data.length}</Button>
              {PACKAGING_CATEGORIES.filter((c) => counts[c.key]).map((c) => (
                <Button variant="outline" key={c.key} type="button" onClick={() => update("category", category === c.key ? "" : c.key)} aria-pressed={category === c.key} className={`flex shrink-0 items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm ${category === c.key ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-muted-foreground"}`}>
                  <img src={c.image} alt="" className="h-6 w-6 rounded-full object-cover" />{c.label} · {counts[c.key]}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
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
              {hasFilters && <Button variant="ghost" size="sm" onClick={clearAll}>Reset filters</Button>}
            </div>
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
          <div aria-label="Manufacturer results" className="mt-3 space-y-3">
            {isLoading ? <><ManufacturerCardSkeleton /><ManufacturerCardSkeleton /></>
              : isError ? <div className="py-12 text-center"><p>We couldn't load manufacturers.</p><Button variant="outline" onClick={() => refetch()} className="mt-4 rounded-full">Retry</Button></div>
              : results.length ? results.map((m) => <ManufacturerCard key={m.id} m={m} selected={selected.includes(m.id)} onToggleSelect={() => toggle(m.id)} waText={waText} />)
              : <div className="py-12 text-center"><h3 className="text-lg font-semibold">No manufacturers match yet</h3><p className="mt-1 text-sm text-muted-foreground">Try clearing the filters, or share your requirement above and we'll find suppliers for you.</p><Button variant="outline" onClick={clearAll} className="mt-4 rounded-full">Clear filters</Button></div>}
          </div>
        </section>
      </main>

      <DirectoryFooter />
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-[1000px] px-4 py-3 md:px-6">
          {selectedMakers.length > 0 && <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1" aria-label="Selected manufacturers">
            {selectedMakers.map((m) => <Button key={m.id} variant="outline" size="sm" onClick={() => toggle(m.id)} aria-label={`Remove ${m.name}`} className="h-7 shrink-0 rounded-full border-primary/40 bg-primary/10 text-xs text-primary">{m.name}<X className="h-3 w-3" /></Button>)}
          </div>}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 text-sm">
              <p className="font-semibold">{selectedMakers.length ? `${selectedMakers.length} manufacturer${selectedMakers.length === 1 ? "" : "s"} selected` : "Your shortlist is empty"}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{selectedMakers.length ? (needsText ? "Add your packaging requirement" : "Message ready · send in each chat") : "Choose manufacturers to get started"}</p>
            </div>
            <Button className="whatsapp-cta h-11 shrink-0 rounded-full px-4 sm:px-6" disabled={selectedMakers.length === 0} onClick={sendToSelected}>
              <MessageCircle />{needsText && selected.length ? "Add requirement" : "WhatsApp selected"}
            </Button>
          </div>
        </div>
      </div>
      <div className={selectedMakers.length ? "h-36" : "h-24"} />
    </div>
  );
}
