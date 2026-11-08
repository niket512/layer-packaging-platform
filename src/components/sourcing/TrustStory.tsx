import { Quote, Star } from "lucide-react";

const brands = ["Dastaan", "Bloom Naturals", "Kaapi Co.", "Urban Roots", "Masala Tales", "Pure Sip"];
const reviews = [
  ["We had three box quotes on WhatsApp the same afternoon — and the cheapest one was also the best fit.", "Riya S.", "Founder, Dastaan"],
  ["Our pouch MOQ dropped from 10,000 to 2,000. That alone let us launch a new SKU.", "Arjun M.", "Co-founder, Kaapi Co."],
  ["No more chasing factories on calls. We share the brief once and compare clean quotes.", "Neha K.", "Ops lead, Bloom Naturals"],
];

export default function TrustStory() {
  return (
    <section aria-label="Brands and reviews" className="mx-auto mt-8 w-full max-w-[820px] rounded-2xl border border-border bg-card p-4 text-left shadow-[0_2px_16px_rgba(0,0,0,0.06)] sm:p-6">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">Trusted by growing D2C brands</p>
        <div className="mt-3 flex flex-wrap gap-2">{brands.map(b => <span key={b} className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-foreground/80">{b}</span>)}</div>
      </div>
      <div className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto border-t border-border pt-5 pb-1 [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible">
        {reviews.map(([q, n, r]) => (
          <figure key={n} className="w-[82%] shrink-0 snap-start rounded-xl bg-muted/40 p-4 sm:w-auto">
            <div className="flex items-center justify-between"><Quote className="h-4 w-4 text-primary" /><span className="flex gap-0.5 text-primary">{[0,1,2,3,4].map(i => <Star key={i} className="h-3 w-3 fill-current" />)}</span></div>
            <blockquote className="mt-2 text-sm leading-relaxed text-foreground">{q}</blockquote>
            <figcaption className="mt-3 text-xs"><span className="font-semibold text-foreground">{n}</span><span className="text-muted-foreground"> · {r}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
