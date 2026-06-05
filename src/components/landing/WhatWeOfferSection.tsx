import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { ArrowRight } from "lucide-react";
import standUpPouches from "@/assets/category-stand-up-pouches.jpg";
import flatPouches from "@/assets/category-flat-pouches.jpg";
import wrappers from "@/assets/category-wrappers.jpg";

const items = [
  { image: standUpPouches, title: "Stand-Up Pouches", desc: "Custom printed, food-grade, flexible MOQs. Perfect for snacks, supplements, and pantry brands." },
  { image: flatPouches, title: "Flat & Pillow Pouches", desc: "Lightweight, cost-effective packaging for sachets, powders, and single-serve formats." },
  { image: wrappers, title: "Custom Wrappers", desc: "High-quality printed wrappers for confectionery, bakery, and FMCG products." },
];

export default function WhatWeOfferSection() {
  const { ref, isVisible } = useScrollReveal();
  return (
    <section ref={ref} id="what-we-offer" className="pt-12 md:pt-[88px] pb-8 md:pb-10 bg-background">
      <div className="mx-auto max-w-content px-5 md:px-6">
        <div className={`mx-auto max-w-2xl text-center ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="label-eyebrow">What We Offer</p>
          <h2 className="mt-3 font-heading text-[26px] font-semibold leading-tight tracking-tight text-foreground md:text-[38px]">
            Starting with packaging — built to grow with you
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground md:mt-4 md:text-base">
            We're beginning with flexible, high-quality packaging solutions for FMCG brands — pouches, wrappers, and more — with plans to expand across categories.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:mt-12 md:gap-6 md:grid-cols-3">
          {items.map((it, i) => (
            <div
              key={it.title}
              className={`rounded-2xl border border-border bg-card p-6 card-soft ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="h-40 overflow-hidden rounded-xl bg-secondary">
                <img
                  src={it.image}
                  alt={it.title}
                  loading="lazy"
                  width={800}
                  height={640}
                  className="h-full w-full object-cover"
                />
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
