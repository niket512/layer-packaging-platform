import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Sparkles, Brain, Workflow, ShieldCheck, Users } from "lucide-react";
import factoryLine from "@/assets/factory-line.jpg";

const brandPoints = [
  {
    icon: Brain,
    title: "AI-based Discovery",
    desc: "Share your specs, formulations, or designs with AI and pick the best fit from 1000s of manufacturers — by MOQ, price, lead time, and past projects.",
  },
  {
    icon: Workflow,
    title: "End-to-End Automation",
    desc: "From matching a manufacturer to doorstep delivery — zero operations on your side, with real-time status at every step.",
  },
];

const manufacturerPoints = [
  {
    icon: ShieldCheck,
    title: "Quality Leads Only",
    desc: "No spam. Only verified brands with complete brand details, specs, and intent — so your team focuses on real orders.",
  },
  {
    icon: Users,
    title: "Manage Clients in One Place",
    desc: "Run conversations, samples, approvals, and orders with every client from a single dashboard — cut the human effort.",
  },
];

export default function IntelligentAISection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      id="intelligent-ai"
      className="relative overflow-hidden py-14 md:py-20 bg-background"
    >
      {/* Animated gradient backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[calc(50%-240px)] top-0 h-[480px] w-[480px] rounded-full bg-primary/10 blur-3xl animate-ai-pulse" />
        <div className="absolute right-[-120px] bottom-[-120px] h-[360px] w-[360px] rounded-full bg-primary/5 blur-3xl animate-ai-pulse [animation-delay:1.2s]" />

      </div>

      <div className="mx-auto max-w-content px-[5vw] md:px-8">
        <div className={`mx-auto max-w-2xl text-center ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[1.5px] text-primary">
            <Sparkles className="h-3.5 w-3.5 animate-ai-sparkle" />
            Intelligent & AI-Powered
          </span>
          <h2 className="mt-4 font-heading text-[32px] font-semibold tracking-tight text-foreground md:text-[38px]">
            One AI platform.{" "}
            <span className="bg-gradient-to-r from-primary via-primary to-blue-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-ai-gradient">
              Built for brands and manufacturers.
            </span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            AI does the discovery, matching, and coordination — you stay focused on what matters.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* For Brands */}
          <div
            className={`group relative rounded-2xl border border-border bg-card p-7 card-soft transition-all hover:border-primary/40 hover:-translate-y-1 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
            style={{ animationDelay: "120ms" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.6)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="label-eyebrow">For Brands</p>
                <h3 className="font-heading text-lg font-semibold text-foreground">AI that sources for you</h3>
              </div>
            </div>

            <ul className="mt-6 space-y-5">
              {brandPoints.map((p, i) => (
                <li
                  key={p.title}
                  className={`flex gap-4 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
                  style={{ animationDelay: `${220 + i * 100}ms` }}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary transition-transform group-hover:scale-110">
                    <p.icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-heading text-base font-semibold text-foreground">{p.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* For Manufacturers */}
          <div
            className={`group relative rounded-2xl border border-border bg-card p-7 card-soft transition-all hover:border-primary/40 hover:-translate-y-1 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.6)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="label-eyebrow">For Manufacturers</p>
                <h3 className="font-heading text-lg font-semibold text-foreground">Only the leads worth your time</h3>
              </div>
            </div>

            <ul className="mt-6 space-y-5">
              {manufacturerPoints.map((p, i) => (
                <li
                  key={p.title}
                  className={`flex gap-4 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
                  style={{ animationDelay: `${300 + i * 100}ms` }}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary transition-transform group-hover:scale-110">
                    <p.icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-heading text-base font-semibold text-foreground">{p.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
        </div>

        {/* Visual: real verified network */}
        <div
          className={`mt-8 overflow-hidden rounded-2xl border border-border card-soft ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
          style={{ animationDelay: "360ms" }}
        >
          <div className="relative">
            <img
              src={factoryLine}
              alt="Verified packaging manufacturing line"
              loading="lazy"
              width={1280}
              height={896}
              className="h-[220px] w-full object-cover transition-transform duration-[1200ms] hover:scale-[1.03] md:h-[300px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="label-eyebrow">Verified Network</p>
                <p className="mt-1 font-heading text-lg font-semibold text-foreground">1,000+ manufacturers. Every one vetted.</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background/90 px-3 py-1 text-[11px] font-semibold text-primary backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5" />
                Quality-checked
              </span>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
