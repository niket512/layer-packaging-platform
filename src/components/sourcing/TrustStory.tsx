import { Quote, Star } from "lucide-react";

const brands = ["Dastaan", "Bloom Naturals", "Kaapi Co.", "Urban Roots", "Masala Tales", "Pure Sip"];
const reviews = [
  ["We had three box quotes on WhatsApp the same afternoon — and the cheapest one was also the best fit.", "Riya S.", "Founder, Dastaan"],
  ["Our pouch MOQ dropped from 10,000 to 2,000. That alone let us launch a new SKU.", "Arjun M.", "Co-founder, Kaapi Co."],
  ["No more chasing factories on calls. We share the brief once and compare clean quotes.", "Neha K.", "Ops lead, Bloom Naturals"],
];

export default function TrustStory() {
  return (
    <section aria-label="Brands and reviews" className="mx-auto mt-8 w-full max-w-[820px] text-left">
      <div>
        <p className="text-xs font-medium text-muted-foreground">Trusted by growing D2C brands</p>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">{brands.map(b => <span key={b} className="text-sm font-semibold text-foreground/70">{b}</span>)}</div>
      </div>
      <div className="-mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
        {reviews.map(([q, n, r]) => (
          <figure key={n} className="w-[80%] shrink-0 snap-start rounded-2xl border border-border bg-card p-4 sm:w-auto">
            <div className="flex items-center justify-between"><Quote className="h-4 w-4 text-primary" /><span className="flex gap-0.5 text-primary">{[0,1,2,3,4].map(i => <Star key={i} className="h-3 w-3 fill-current" />)}</span></div>
            <blockquote className="mt-2 text-sm leading-relaxed text-foreground">{q}</blockquote>
            <figcaption className="mt-3 text-xs"><span className="font-semibold text-foreground">{n}</span><span className="text-muted-foreground"> · {r}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
