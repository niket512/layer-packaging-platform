import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const reviews = [
  { quote: "Used to spend two weeks finding a pouch manufacturer. Now I spend that time arguing about flavour names instead. Much better problem to have.", name: "Ravi V.", role: "Founder, The Snack Lab", initials: "RV" },
  { quote: "Our last supplier went silent post-payment. Snaplogo's tracking meant we actually knew where our order was — a novel concept, apparently.", name: "Ananya S.", role: "Co-Founder, Bare Basics", initials: "AS" },
  { quote: "Pricing was exactly what was quoted. I almost called to check if something had gone wrong. It hadn't. Highly recommend.", name: "Karan M.", role: "Head of Ops, Daily Ritual", initials: "KM" },
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
        <div className="flex w-max gap-5 pr-6 animate-marquee">
          {[...reviews, ...reviews].map((r, i) => (
            <Card key={i} r={r} />
          ))}
        </div>
      </div>
    </section>
  );
}
