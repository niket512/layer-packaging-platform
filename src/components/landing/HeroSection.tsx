import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const scrollToAccess = () => {
  scrollTo("request-access");
  window.dispatchEvent(new Event("open-access-form"));
};

const trust = ["Verified Manufacturers", "Flexible MOQs", "End-to-End Tracking"];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-20 pb-20 md:pt-28 md:pb-32">
      <div className="pointer-events-none absolute inset-0 gradient-mesh" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />

      <div className="relative mx-auto max-w-content px-6 text-center">
        <h1 className="font-heading text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[56px]">
          Source Smarter. Faster. Better.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          The procurement platform built for D2C brands. Discover verified manufacturers, coordinate orders, and track delivery — all in one place.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button variant="hero" size="pill" onClick={scrollToAccess}>
            Get Early Access
          </Button>
          <Button variant="hero-outline" size="pill" onClick={() => scrollTo("how-it-works")}>
            See How It Works
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-xs text-muted-foreground">
          {trust.map((t, i) => (
            <span key={t} className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
                {t}
              </span>
              {i < trust.length - 1 && <span className="text-border">·</span>}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
