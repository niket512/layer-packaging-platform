import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Package, Layers, Sparkles, ArrowRight } from "lucide-react";

const items = [
  { icon: Package, title: "Stand-Up Pouches", desc: "Custom printed, food-grade, flexible MOQs. Perfect for snacks, supplements, and pantry brands." },
  { icon: Layers, title: "Flat & Pillow Pouches", desc: "Lightweight, cost-effective packaging for sachets, powders, and single-serve formats." },
  { icon: Sparkles, title: "Custom Wrappers", desc: "High-quality printed wrappers for confectionery, bakery, and FMCG products." },
];

export default function WhatWeOfferSection() {
  const { ref, isVisible } = useScrollReveal();
  return (
    <section ref={ref} id="what-we-offer" className="pt-14 md:pt-[88px] pb-8 md:pb-10 bg-background">
      <div className="mx-auto max-w-content px-6">
        <div className={`mx-auto max-w-2xl text-center ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="label-eyebrow">What We Offer</p>
          <h2 className="mt-3 font-heading text-[32px] font-semibold tracking-tight text-foreground md:text-[38px]">
            Starting with packaging — built to grow with you
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            We're beginning with flexible, high-quality packaging solutions for FMCG brands — pouches, wrappers, and more — with plans to expand across categories.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((it, i) => (
            <div
              key={it.title}
              className={`rounded-2xl border border-border bg-card p-6 card-soft ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex h-40 items-center justify-center rounded-xl bg-secondary">
                <it.icon className="h-14 w-14 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">{it.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a href="#sign-up" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            More categories coming soon <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
