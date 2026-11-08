const brands = ["Dastaan", "Bloom Naturals", "Kaapi Co.", "Urban Roots", "Masala Tales", "Pure Sip"];
const reviews = [
  ["We had three box quotes on WhatsApp the same afternoon — and the cheapest one was also the best fit.", "Riya S.", "Founder, Dastaan"],
  ["Our pouch MOQ dropped from 10,000 to 2,000. That alone let us launch a new SKU.", "Arjun M.", "Co-founder, Kaapi Co."],
  ["No more chasing factories on calls. We share the brief once and compare clean quotes.", "Neha K.", "Ops lead, Bloom Naturals"],
];

export default function TrustStory() {
  return (
    <section aria-label="Sourcing support and illustrative reviews" className="mx-auto mt-5 w-full max-w-[1120px] border-y border-border py-3 text-left sm:mt-6 sm:py-4">
      <div>
        <p className="text-[11px] font-medium text-muted-foreground">Fictional brand & review preview · Not endorsements</p>
        <div className="mt-2 flex gap-x-4 overflow-x-auto pb-1 sm:flex-wrap sm:gap-y-1">{brands.map(b => <span key={b} className="shrink-0 text-xs font-semibold text-foreground/80">{b}</span>)}</div>
      </div>
      <div className="mt-2 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
        {reviews.map(([q, n, r]) => (
          <figure key={n} className="w-[88%] shrink-0 snap-start border-l-2 border-primary/30 pl-3 sm:w-auto">
            <blockquote className="text-xs leading-relaxed text-foreground">“{q}”</blockquote>
            <figcaption className="mt-1.5 text-[11px] leading-relaxed"><span className="font-semibold text-foreground">{n}</span><span className="text-muted-foreground"> · {r}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
