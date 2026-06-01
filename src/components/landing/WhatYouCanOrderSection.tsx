import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Package2, Sandwich, Layers3, Film, Tag, Boxes } from "lucide-react";

const items = [
  { icon: Package2, title: "Pouches packaging", desc: "Custom stand-up and flat pouches tailored perfectly for FMCG brand requirements." },
  { icon: Sandwich, title: "Wrappers packaging", desc: "High-quality protective wrappers designed for snacks, confectionery, and retail products." },
  { icon: Layers3, title: "Flexible packaging", desc: "Versatile, high-barrier film packaging solutions to maximize product shelf life." },
  { icon: Film, title: "Custom rollstock", desc: "Premium printed rollstock engineered for high-speed automated packaging lines." },
  { icon: Tag, title: "Labels & stickers", desc: "Vibrant, custom-cut brand labels to elevate shelf presence and product packaging." },
  { icon: Boxes, title: "Raw materials", desc: "Ethically sourced, verified base components and substrates for manufacturing." },
];

export default function WhatYouCanOrderSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} id="what-you-can-order" className="bg-muted/40 py-16 md:py-20">
      <div className="container">
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary normal-case">What you can order</p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-heading text-balance sm:text-4xl">
            Built for our initial PMF categories
          </h2>
          <p className="mt-4 text-body text-pretty">
            Six categories live today — engineered for D2C brands, startups, and SMEs scaling production.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <div
              key={it.title}
              className={`group rounded-2xl border border-border bg-surface-raised p-6 transition-all duration-500 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
              style={{ animationDelay: `${150 + i * 60}ms` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-subtle text-primary transition-transform duration-300 group-hover:scale-105">
                <it.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-heading text-base font-semibold text-heading">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-body">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
