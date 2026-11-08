import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, ExternalLink, FileText, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { filterNetwork, networkManufacturers, networkStates, sourceLinks, type NetworkManufacturer } from "@/lib/manufacturer-network";
import { PACKAGING_CATEGORIES } from "@/data/directory";

const sourceLabel = (source: string) => source === "official website" ? "Company website source" : source === "credible directory" ? "Directory source" : "Further checks needed";

export default function ManufacturerNetwork() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const state = params.get("state") ?? "";
  const source = params.get("source") ?? "";
  const [limit, setLimit] = useState(24);
  const [selected, setSelected] = useState<NetworkManufacturer | null>(null);
  const results = useMemo(() => filterNetwork(query, state, source), [query, state, source]);
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
    setLimit(24);
  };
  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-content items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link to="/" className="text-xl font-bold">snaplogo<span className="text-primary">.</span></Link>
        <Button asChild size="sm" className="rounded-full"><Link to="/">Get packaging quotes <ArrowRight /></Link></Button>
      </div>
    </header>
    <main className="mx-auto max-w-content px-4 pb-12 sm:px-6">
      <Link to="/" className="mt-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"><ArrowLeft className="h-3.5 w-3.5" />Back to sourcing</Link>
      <section className="grid gap-5 border-b border-border pb-6 pt-5 md:grid-cols-[1fr_260px] md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">Packaging · India</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Manufacturer network</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Explore packaging businesses across India. See what they make, where they’re based and the sources behind each listing.</p>
        </div>
        <div className="flex gap-7 md:justify-end">
          <div><p className="text-2xl font-bold">{networkManufacturers.length}</p><p className="text-xs text-muted-foreground">Listed businesses</p></div>
          <div><p className="text-2xl font-bold">{networkStates.length}</p><p className="text-xs text-muted-foreground">States covered</p></div>
        </div>
      </section>
      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />These are research-backed references, not confirmed Snaplogo partners. Source labels are not factory audits; capabilities and availability need confirmation.</p>
      <section aria-label="Manufacturer directory" className="mt-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_190px_210px]">
          <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Search manufacturers" value={query} onChange={event => update("q", event.target.value)} placeholder="Company, city or packaging type" className="h-10 pl-9" /></div>
          <select aria-label="Filter by state" className="h-10 min-w-0 rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring" value={state} onChange={event => update("state", event.target.value)}><option value="">All states</option>{networkStates.map(value => <option key={value}>{value}</option>)}</select>
          <select aria-label="Filter by source" className="h-10 min-w-0 rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring" value={source} onChange={event => update("source", event.target.value)}><option value="">All source types</option><option value="official website">Company website</option><option value="credible directory">Business directory</option><option value="weak lead">Further checks needed</option></select>
        </div>
        <div className="my-4 flex items-center justify-between"><p aria-live="polite" className="text-sm text-muted-foreground">{results.length} businesses{state && ` in ${state}`}</p>{(query || state || source) && <Button variant="ghost" size="sm" onClick={() => { setParams({}); setLimit(24); }}>Clear filters</Button>}</div>
        <div className="grid gap-3 md:grid-cols-2">
          {results.slice(0, limit).map(entry => <article key={`${entry.company_name}-${entry.city}`} className="flex min-w-0 flex-col rounded-lg border border-border bg-card p-4 sm:p-5">
            <div className="flex gap-3">
              <img src={PACKAGING_CATEGORIES[0].image} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover" />
              <div className="min-w-0"><h2 className="break-words text-base font-semibold leading-snug">{entry.company_name}</h2><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3 shrink-0" />{[entry.city, entry.state].filter(Boolean).join(", ") || "Location not provided"}</p></div>
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{entry.products_and_capabilities || "Product details to be confirmed."}</p>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4"><span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"><FileText className="h-3.5 w-3.5" />{sourceLabel(entry.verification_status)}</span><Button variant="outline" size="sm" className="h-8 rounded-full text-xs" onClick={() => setSelected(entry)}>View details <ArrowRight /></Button></div>
          </article>)}
        </div>
        {!results.length && <div className="py-12 text-center"><Building2 className="mx-auto h-8 w-8 text-muted-foreground" /><h2 className="mt-3 font-semibold">No matching businesses</h2><p className="mt-1 text-sm text-muted-foreground">Try another city, packaging type or state.</p></div>}
        {results.length > limit && <div className="mt-6 text-center"><Button variant="outline" className="rounded-full" onClick={() => setLimit(value => value + 24)}>Show more manufacturers <ArrowRight /></Button></div>}
      </section>
      <footer className="mt-10 flex flex-wrap justify-between gap-3 border-t border-border pt-5 text-xs text-muted-foreground"><a href="mailto:contact@snapit.club">contact@snapit.club</a><Link to="/privacy-policy">Privacy policy</Link></footer>
    </main>
    <Dialog open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}>
      <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-lg">
        {selected && <><DialogHeader><DialogTitle className="pr-6 text-xl leading-snug">{selected.company_name}</DialogTitle><DialogDescription>{[selected.city, selected.state].filter(Boolean).join(", ")} · {sourceLabel(selected.verification_status)}</DialogDescription></DialogHeader>
          <dl className="space-y-4 text-sm">{[["Products & capabilities", selected.products_and_capabilities], ["Address", selected.address], ["Industries served", selected.industries_served], ["Order notes", selected.moq_or_packaging_notes], ["Supplier quality claims · not independently verified", selected.certifications_or_quality_claims], ["Research notes", selected.notes]].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt className="font-semibold">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words leading-relaxed text-muted-foreground">{value}</dd></div>)}</dl>
          <div className="border-t border-border pt-4"><h3 className="text-sm font-semibold">Listing sources</h3><div className="mt-2 space-y-2">{sourceLinks(selected).map((url, index) => <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 break-all text-xs text-primary hover:underline"><ExternalLink className="h-3.5 w-3.5 shrink-0" />{index === 0 ? "Website" : `Source ${index + 1}`} · {new URL(url).hostname}</a>)}</div></div>
          <p className="text-xs leading-relaxed text-muted-foreground">A listing does not imply a partnership or endorsement by Snaplogo. Confirm factory ownership, specifications and commercial terms before ordering.</p>
        </>}
      </DialogContent>
    </Dialog>
  </div>;
}