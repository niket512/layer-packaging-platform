import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, ExternalLink, MapPin, Search, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { manufacturerMoq } from "@/lib/manufacturer-moq";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { filterNetwork, manufacturerContact, networkManufacturers, networkStates, pouchTypes, type NetworkManufacturer } from "@/lib/manufacturer-network";

function ContactDetails({ entry }: { entry: NetworkManufacturer }) {
  const contact = manufacturerContact(entry.company_name);
  return <div className="min-w-0">
    {contact.whatsapp ? <Button asChild variant="ghost" size="sm" className="h-11 px-0 text-sm text-primary sm:h-8 sm:text-xs"><a href={contact.whatsapp} target="_blank" rel="noopener noreferrer" title="Open this listed number in WhatsApp; account availability is unconfirmed"><MessageCircle className="h-4 w-4" />{contact.phone} <ExternalLink className="h-3 w-3" /></a></Button> : <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><MessageCircle className="h-3.5 w-3.5" />Contact not published</span>}
  </div>;
}

function MinimumOrder({ entry }: { entry: NetworkManufacturer }) {
  const summary = manufacturerMoq(entry.company_name, entry.moq_or_packaging_notes);
  return <div className="min-w-0">
    {summary.tiers.length ? <dl className="space-y-2">{summary.tiers.map(tier => <div key={tier.label} className="flex items-baseline justify-between gap-3 lg:block">
      <dt className="text-xs leading-snug text-muted-foreground">{tier.label}</dt>
      <dd className="shrink-0 text-sm font-semibold tabular-nums text-foreground lg:mt-0.5">{tier.value}</dd>
    </div>)}</dl> : <p className="text-sm text-muted-foreground">Confirm with supplier</p>}
    {summary.note && <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{summary.note}</p>}
  </div>;
}

export default function ManufacturerNetwork() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const state = params.get("state") ?? "";
  const family = params.get("family") ?? "";
  const pouchType = params.get("type") ?? "";
  const contactsOnly = params.get("contact") === "yes";
  const [limit, setLimit] = useState(24);
  const [selected, setSelected] = useState<NetworkManufacturer | null>(null);
  const results = useMemo(() => filterNetwork(query, state, family, pouchType, contactsOnly), [query, state, family, pouchType, contactsOnly]);
  const loadMore = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = loadMore.current;
    if (!element || results.length <= limit) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) setLimit(value => value + 24);
    }, { rootMargin: "300px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [limit, results.length]);
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key === "family") next.delete("type");
    setParams(next, { replace: true });
    setLimit(24);
  };
  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-content items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link to="/" className="text-xl font-bold">snaplogo<span className="text-primary">.</span></Link>
        <Button asChild size="sm" className="rounded-full"><Link to="/"><span className="sm:hidden">Get quotes</span><span className="hidden sm:inline">Get packaging quotes</span> <ArrowRight /></Link></Button>
      </div>
    </header>
    <main className="mx-auto max-w-content px-4 pb-12 sm:px-6">
      <Link to="/" className="mt-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"><ArrowLeft className="h-3.5 w-3.5" />Back to sourcing</Link>
      <section className="grid gap-3 border-b border-border pb-4 pt-3 sm:gap-5 sm:pb-5 sm:pt-4 md:grid-cols-[1fr_260px] md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">Packaging · India</p>
          <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-4xl">Manufacturer network</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Products, minimum orders and direct contacts across India.</p>
        </div>
        <div className="flex gap-7 md:justify-end">
          <div className="flex items-baseline gap-2 md:block"><p className="text-lg font-bold sm:text-2xl">{networkManufacturers.length}</p><p className="text-xs text-muted-foreground">Listed businesses</p></div>
          <div className="flex items-baseline gap-2 md:block"><p className="text-lg font-bold sm:text-2xl">{networkStates.length}</p><p className="text-xs text-muted-foreground">States covered</p></div>
        </div>
      </section>
      <section aria-label="Manufacturer directory" className="mt-2">
        <div className="sticky top-0 z-10 border-b border-border bg-background py-3">
        <div className="mb-3 flex gap-2" aria-label="Packaging categories">
          {[["", "All packaging"], ["boxes", "Boxes"], ["pouches", "Pouches"]].map(([value, label]) => <Button key={value} size="sm" variant={family === value ? "default" : "outline"} aria-pressed={family === value} onClick={() => update("family", value)}>{label}</Button>)}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_190px_190px]">
          <div className="relative col-span-2 sm:col-span-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Search manufacturers" value={query} onChange={event => update("q", event.target.value)} placeholder="Company, city or packaging type" className="h-10 pl-9" /></div>
          <select aria-label="Filter by state" className="h-10 min-w-0 rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring" value={state} onChange={event => update("state", event.target.value)}><option value="">All states</option>{networkStates.map(value => <option key={value}>{value}</option>)}</select>
          {family === "pouches" && <select aria-label="Filter by pouch style" className="h-10 min-w-0 rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring" value={pouchType} onChange={event => update("type", event.target.value)}><option value="">All pouch styles</option>{pouchTypes.map(value => <option key={value}>{value}</option>)}</select>}
        </div>
        <label className="mt-3 flex w-fit cursor-pointer items-center gap-2 text-xs text-muted-foreground"><Checkbox checked={contactsOnly} onCheckedChange={checked => update("contact", checked === true ? "yes" : "")} />With contact number</label>
        </div>
        <div className="my-3 flex items-center justify-between"><p aria-live="polite" className="text-sm text-muted-foreground">{results.length} businesses{state && ` in ${state}`}</p>{(query || state || family || contactsOnly) && <Button variant="ghost" size="sm" onClick={() => { setParams({}); setLimit(24); }}>Clear filters</Button>}</div>
        <div className="hidden grid-cols-[1.1fr_1.5fr_1fr_180px] gap-6 border-b border-border bg-muted/40 px-4 py-3 text-xs font-semibold text-muted-foreground lg:grid"><span>Company & location</span><span>Products</span><span>Minimum order</span><span>Contact</span></div>
        <div className="grid gap-3 lg:gap-0">
          {results.slice(0, limit).map(entry => <article key={`${entry.company_name}-${entry.city}`} className="grid min-w-0 gap-3 rounded-lg border border-border bg-card p-3 sm:p-4 lg:grid-cols-[1.1fr_1.5fr_1fr_180px] lg:gap-6 lg:rounded-none lg:border-x-0 lg:border-t-0">
            <div className="flex gap-3">
              <div className="min-w-0"><h2 className="break-words text-base font-semibold leading-snug">{entry.company_name}</h2><p className="mt-1 flex items-start gap-1 text-sm text-muted-foreground sm:text-xs"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />{entry.location_label || [entry.city, entry.state].filter(Boolean).join(", ") || "Location not provided"}</p>{entry.business_type && entry.business_type !== "Packaging business" && <p className="mt-2 text-xs font-medium text-primary">{entry.business_type}</p>}</div>
            </div>
            <dl className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-2 text-sm leading-relaxed lg:block">
              <dt className="font-semibold text-foreground lg:hidden">Makes</dt><dd className="line-clamp-3 break-words text-muted-foreground">{entry.products_and_capabilities || "Product details to be confirmed."}</dd>
            </dl>
            <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-start gap-x-2 border-t border-border pt-3 lg:block lg:border-0 lg:pt-0"><span className="text-xs font-semibold leading-5 text-muted-foreground lg:hidden">MOQ</span><MinimumOrder entry={entry} /></div>
            <div className="flex items-center justify-between gap-2 border-t border-border pt-1 lg:flex-col lg:items-start lg:justify-start lg:border-0 lg:pt-0"><ContactDetails entry={entry} /><Button variant="ghost" size="sm" className="h-10 shrink-0 px-2 text-xs" onClick={() => setSelected(entry)}>Full details <ArrowRight /></Button></div>
          </article>)}
        </div>
        {!results.length && <div className="py-12 text-center"><Building2 className="mx-auto h-8 w-8 text-muted-foreground" /><h2 className="mt-3 font-semibold">No matching businesses</h2><p className="mt-1 text-sm text-muted-foreground">Try another city, packaging type or state.</p></div>}
        {results.length > limit && <div ref={loadMore} className="mt-6 text-center"><Button variant="outline" className="rounded-full" onClick={() => setLimit(value => value + 24)}>Show more manufacturers <ArrowRight /></Button></div>}
      </section>
      <footer className="mt-10 flex flex-wrap justify-between gap-3 border-t border-border pt-5 text-xs text-muted-foreground"><a href="mailto:contact@snapit.club">contact@snapit.club</a><Link to="/privacy-policy">Privacy policy</Link></footer>
    </main>
    <Dialog open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}>
      <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-lg">
        {selected && <><DialogHeader><DialogTitle className="pr-6 text-xl leading-snug">{selected.company_name}</DialogTitle><DialogDescription>{selected.location_label || [selected.city, selected.state].filter(Boolean).join(", ")}</DialogDescription></DialogHeader>
          <ContactDetails entry={selected} />
          <dl className="space-y-4 text-sm">{[["Products & capabilities", selected.products_and_capabilities], ["Address", selected.address], ["Industries served", selected.industries_served], ["Order notes", selected.moq_or_packaging_notes], ["Quality & certifications", selected.certifications_or_quality_claims], ["Notes", selected.notes]].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt className="font-semibold">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words leading-relaxed text-muted-foreground">{value}</dd></div>)}</dl>
          <p className="text-xs leading-relaxed text-muted-foreground">A listing does not imply a partnership or endorsement by Snaplogo. Confirm factory ownership, specifications and commercial terms before ordering.</p>
        </>}
      </DialogContent>
    </Dialog>
  </div>;
}
