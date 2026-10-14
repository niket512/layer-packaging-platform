import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, Check, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequirementForm } from "@/components/directory/RequirementForm";
import { ManufacturerCard, ManufacturerCardSkeleton } from "@/components/directory/ManufacturerCard";
import { fetchPublishedManufacturers, categoryLabel, placeOf, PACKAGING_CATEGORIES, moqUnits, waDigits, type DirectoryManufacturer } from "@/data/directory";

export default function ManufacturersDirectory() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") ?? "";
  const sort = params.get("sort") ?? "relevance";
  const { data = [], isLoading, isError, refetch } = useQuery({ queryKey: ["directory"], queryFn: fetchPublishedManufacturers });
  const [selected, setSelected] = useState<string[]>([]);
  const [contact, setContact] = useState("");
  const [reqText, setReqText] = useState("");
  const [review, setReview] = useState(false);
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
  const counts = useMemo(() => Object.fromEntries(PACKAGING_CATEGORIES.map((c) => [c.key, data.filter((m) => m.packaging_categories.includes(c.key)).length])), [data]);
  const passesFilters = (m: DirectoryManufacturer) => !category || m.packaging_categories.includes(category as never);
  const results = useMemo(() => {
    const rows = data.filter(passesFilters);
    if (sort === "name") rows.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "location") rows.sort((a, b) => placeOf(a).localeCompare(placeOf(b)));
    if (sort === "moq") rows.sort((a, b) => (moqUnits(a) ?? Infinity) - (moqUnits(b) ?? Infinity));
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, category, sort]);
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
          <div className="mt-5">
            <RequirementForm contact={contact} onContact={setContact} text={reqText} onText={setReqText} />
          </div>
        </section>

        <section id="directory" aria-labelledby="dir-h" className="pt-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="dir-h" className="text-lg font-semibold">Manufacturers</h2>
            {reachable.length > 0 && (
              <Button variant="ghost" size="sm" onClick={addAllShown} className="h-8 text-xs text-muted-foreground">
                {allShownSelected ? "Unselect all shown" : `Select all (${reachable.length})`}
              </Button>
            )}
          </div>
          <div className="sticky top-0 z-10 -mx-4 mt-2 bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
            <div className="relative">
              <div className="flex gap-1.5 overflow-x-auto pb-1 pr-10 [scrollbar-width:thin]" role="group" aria-label="Packaging type">
                <button type="button" onClick={() => update("category", "")} aria-pressed={!category} className={`shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors ${!category ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>All · {data.length}</button>
                {PACKAGING_CATEGORIES.filter((c) => counts[c.key]).map((c) => (
                  <button key={c.key} type="button" onClick={() => update("category", category === c.key ? "" : c.key)} aria-pressed={category === c.key} className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md py-1 pl-1 pr-3 text-sm transition-colors ${category === c.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                    <img src={c.image} alt="" className="h-6 w-6 rounded object-cover" />{c.label} · {counts[c.key]}
                  </button>
                ))}
              </div>
              <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
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
          <div aria-label="Manufacturer results" className="mt-3 space-y-2">
            {isLoading ? <><ManufacturerCardSkeleton /><ManufacturerCardSkeleton /></>
              : isError ? <div className="py-12 text-center"><p>We couldn't load manufacturers.</p><Button variant="outline" onClick={() => refetch()} className="mt-4 rounded-full">Retry</Button></div>
              : results.length ? results.map((m) => <ManufacturerCard key={m.id} m={m} selected={selected.includes(m.id)} onToggleSelect={() => toggle(m.id)} waText={waText} />)
              : <div className="py-12 text-center"><h3 className="text-lg font-semibold">No manufacturers match yet</h3><p className="mt-1 text-sm text-muted-foreground">Try another packaging type, or share your requirement above and we'll find suppliers for you.</p><Button asChild variant="outline" className="mt-4 rounded-full"><a href="/manufacturers">Show all manufacturers</a></Button></div>}
          </div>
        </section>
      </main>
      {selectedMakers.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur">
          <div className="mx-auto max-w-[1000px] px-4 py-3 md:px-6">
            {review && (
              <div className="mb-3 rounded-lg bg-muted p-3 text-sm">
                <p className="text-xs font-semibold text-muted-foreground">Message preview</p>
                <p className="mt-1 whitespace-pre-wrap">{waText}</p>
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">{selectedMakers.length}</span>
              <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto" aria-label="Selected manufacturers">
                {selectedMakers.map((m) => <button key={m.id} type="button" onClick={() => toggle(m.id)} aria-label={`Remove ${m.name}`} className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md bg-primary/10 px-2 text-xs text-primary">{m.name}<X className="h-3 w-3" /></button>)}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setReview((r) => !r)} className="hidden shrink-0 sm:inline-flex">{review ? "Hide" : "Review"}</Button>
              <Button className="whatsapp-cta h-11 shrink-0 rounded-full px-4 sm:px-6" onClick={sendToSelected}>
                <MessageCircle /><span className="hidden sm:inline">{needsText ? "Add requirement" : "Continue to WhatsApp"}</span><span className="sm:hidden">{needsText ? "Add req." : "WhatsApp"}</span>
              </Button>
            </div>
            <button type="button" onClick={() => setReview((r) => !r)} className="mt-2 text-xs text-muted-foreground underline-offset-4 hover:underline sm:hidden">{review ? "Hide message" : "Review message"}</button>
          </div>
        </div>
      ) : (
        <p className="pointer-events-none fixed bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-card/90 px-3 py-1.5 text-xs text-muted-foreground shadow backdrop-blur">Tick manufacturers to message them on WhatsApp</p>
      )}
      <div className={selectedMakers.length ? (review ? "h-64" : "h-32") : "h-12"} />
    </div>
  );
}
