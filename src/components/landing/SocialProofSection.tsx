import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Quote } from "lucide-react";

const stats = [
  "10+ Verified Manufacturers",
  "Starting from ₹ 5,000 MOQ",
  "FMCG-Focused",
];

export default function SocialProofSection() {
  const { ref, isVisible } = useScrollReveal();
  return (
    <section ref={ref} className="py-12 md:py-20">
      <div className="mx-auto max-w-content px-6">
        <div className={`max-w-2xl ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-primary">Why Brands Choose Snaplogo</p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Built by people who've felt the pain
          </h2>
        </div>

        <div
          className={`relative mt-12 overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-lg md:p-12 ${isVisible ? "animate-reveal-scale" : "opacity-0"}`}
        >
          <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
              backgroundSize: "4px 4px",
            }}
          />
          <Quote className="h-8 w-8 text-primary/60" />
          <blockquote className="mt-4 font-heading text-xl font-medium leading-relaxed text-foreground md:text-2xl">
            "If you solve this, you'll do really well. The biggest problem with IndiaMART is the search chaos — and then the bait-and-switch on pricing. I'm a D2C founder and I'm frustrated as hell."
          </blockquote>
          <p className="mt-6 text-sm text-muted-foreground">— D2C Brand Founder</p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {stats.map((s, i) => (
            <span key={s} className="flex items-center gap-3">
              <span className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
                {s}
              </span>
              {i < stats.length - 1 && <span className="text-border">·</span>}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
