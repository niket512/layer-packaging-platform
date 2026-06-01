import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const reviews = [
  { quote: "Finally a platform that doesn't waste my time with random supplier leads. The matching was sharp and the manufacturer actually showed up.", name: "Priya S.", role: "Founder, [Brand]", initials: "PS" },
  { quote: "Visibility on order status was the biggest win for us. No more chasing on WhatsApp.", name: "Arjun M.", role: "Ops Head, [Brand]", initials: "AM" },
  { quote: "Pricing was exactly what was quoted. That alone is a reason to never go back to IndiaMART.", name: "Riya K.", role: "Co-Founder, [Brand]", initials: "RK" },
  { quote: "We launched our pouches 3 weeks faster than our last sourcing attempt. The difference is night and day.", name: "Karan D.", role: "Founder, [Brand]", initials: "KD" },
  { quote: "Their team handled all the manufacturer back-and-forth so we could focus on our product.", name: "Neha T.", role: "Brand Lead, [Brand]", initials: "NT" },
];

function Card({ r }: { r: typeof reviews[number] }) {
  return (
    <div className="w-[320px] shrink-0 rounded-2xl border border-border bg-card p-7 card-soft">
      <p className="italic text-base leading-relaxed text-foreground line-clamp-4">"{r.quote}"</p>
      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-primary">
          {r.initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function ReviewsSection() {
  const { ref, isVisible } = useScrollReveal();
  return (
    <section ref={ref} id="reviews" className="py-14 md:py-[88px] bg-muted overflow-hidden">
      <div className="mx-auto max-w-content px-6">
        <div className={`mx-auto max-w-2xl text-center ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="label-eyebrow">What Brands Say</p>
          <h2 className="mt-3 font-heading text-[32px] font-semibold tracking-tight text-foreground md:text-[38px]">
            Procurement, the way it should've always been
          </h2>
        </div>
      </div>

      <div className="mt-12 marquee-pause">
        <div className="flex w-max gap-5 animate-marquee">
          {[...reviews, ...reviews].map((r, i) => (
            <Card key={i} r={r} />
          ))}
        </div>
      </div>
    </section>
  );
}
