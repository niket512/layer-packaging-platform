const brands = ["Dastaan", "Bloom Naturals", "Kaapi Co.", "Urban Roots", "Masala Tales", "Pure Sip"];
const reviews = [
  ["No more chasing factories on calls. We share the brief once and compare clean quotes.", "Neha K.", "Ops lead, Bloom Naturals"],
];

export default function TrustStory() {
  return (
    <section aria-label="Sourcing support and illustrative reviews" className="mx-auto mt-5 w-full max-w-[1120px] border-y border-border py-3 text-left sm:mt-6 sm:py-4">
      <div>
        <p className="text-[11px] font-medium text-muted-foreground">Fictional brand & review preview · Not endorsements</p>
        <div className="mt-3 grid grid-cols-3 items-center gap-x-3 gap-y-3 pb-2 sm:grid-cols-6 sm:gap-x-5">{brands.map(b => <span key={b} className="min-w-0 text-center text-sm font-bold leading-snug text-foreground sm:text-base">{b}</span>)}</div>
      </div>
      <div className="mt-2">
        {reviews.map(([q, n, r]) => (
          <figure key={n} className="border-l-2 border-primary/30 pl-3">
            <blockquote className="text-xs leading-relaxed text-foreground">“{q}”</blockquote>
            <figcaption className="mt-1.5 text-[11px] leading-relaxed"><span className="font-semibold text-foreground">{n}</span><span className="text-muted-foreground"> · {r}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
