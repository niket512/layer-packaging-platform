import { ClipboardCheck, ArrowLeftRight, MessageSquare, Quote } from "lucide-react";

const brands = ["Dastaan", "Bloom Naturals", "Kaapi Co.", "Urban Roots", "Masala Tales", "Pure Sip"];
const reviews = [
  ["We had three box quotes on WhatsApp the same afternoon — and the cheapest one was also the best fit.", "Riya S.", "Founder, Dastaan"],
  ["Our pouch MOQ dropped from 10,000 to 2,000. That alone let us launch a new SKU.", "Arjun M.", "Co-founder, Kaapi Co."],
  ["No more chasing factories on calls. We share the brief once and compare clean quotes.", "Neha K.", "Ops lead, Bloom Naturals"],
];

export default function TrustStory() {
  return (
    <section aria-label="Sourcing support and illustrative reviews" className="mx-auto mt-8 w-full max-w-[1120px] border-t border-border py-6 text-left sm:mt-10 sm:py-8">
      <p className="text-xs font-semibold uppercase text-primary">One brief. A clearer buying decision.</p>
      <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">You don’t have to chase every factory.</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        {[
          { icon: ClipboardCheck, title: "A brief you can check", copy: "Review and edit your packaging details before sharing your phone number." },
          { icon: ArrowLeftRight, title: "Quotes you can compare", copy: "Compare price, minimum order quantity and production time for your requirement." },
          { icon: MessageSquare, title: "Human follow-up", copy: "Our sourcing team coordinates with manufacturers and shares quotations on WhatsApp." },
        ].map(({ icon: Icon, title, copy }) => <div key={title} className="flex items-start gap-3"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><h3 className="text-sm font-semibold text-foreground">{title}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{copy}</p></div></div>)}
      </div>
      <div className="mt-6 border-t border-border pt-4">
        <p className="text-xs font-semibold text-muted-foreground">Illustrative brand & review preview — sample names and fictional reviews, not verified customer endorsements.</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">{brands.map(b => <span key={b} className="text-xs font-semibold text-muted-foreground">{b}</span>)}</div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {reviews.map(([q, n, r]) => (
          <figure key={n} className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between"><Quote className="h-4 w-4 text-primary" /><span className="text-[10px] font-medium text-muted-foreground">Sample review</span></div>
            <blockquote className="mt-2 text-sm leading-relaxed text-foreground">{q}</blockquote>
            <figcaption className="mt-3 text-xs"><span className="font-semibold text-foreground">{n}</span><span className="text-muted-foreground"> · {r}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
