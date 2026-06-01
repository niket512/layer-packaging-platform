import { useState } from "react";
import { Search } from "lucide-react";

const chips = [
  "Pouches & Sachets",
  "Custom Printed Wrappers",
  "Rigid Boxes",
  "Labels & Stickers",
  "Mailer Boxes",
  "Glass & Plastic Bottles",
];

const openForm = (query?: string) => {
  document.getElementById("sign-up")?.scrollIntoView({ behavior: "smooth" });
  window.dispatchEvent(new CustomEvent("open-access-form", { detail: { requirement: query } }));
};

export default function HeroSection() {
  const [query, setQuery] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openForm(query);
  };

  const onChipClick = (label: string) => {
    setQuery(label);
    openForm(label);
  };

  return (
    <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 hero-bloom">
      <div className="relative mx-auto max-w-content px-[5vw] md:px-8 text-center">
        <h1 className="font-heading text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-[56px]">
          <span className="text-foreground">Source </span>
          <span className="text-primary">Smarter.</span>{" "}
          <span className="text-primary">Faster.</span>{" "}
          <span className="text-primary">Better</span>
        </h1>
        <p className="mx-auto mt-6 max-w-[640px] text-lg text-muted-foreground md:text-xl">
          Find verified manufacturers, manage orders, track shipments, and handle payments seamlessly on one platform
        </p>

        <form
          onSubmit={onSubmit}
          className="mx-auto mt-10 flex w-full max-w-2xl items-center rounded-full border border-primary/40 bg-background p-1.5 shadow-[0_2px_16px_rgba(37,99,235,0.08)] focus-within:border-primary"
        >
          <Search className="ml-4 h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you looking for? e.g. Stand-up pouches for 500 units"
            className="h-10 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-[13px] font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started →
          </button>
        </form>

        <div className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-2">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChipClick(c)}
              className="inline-flex h-7 items-center rounded-full border border-primary bg-background px-3 text-[13px] text-primary transition-colors hover:bg-secondary"
            >
              {c}
            </button>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">Trusted by emerging D2C brands in FMCG</p>
      </div>
    </section>
  );
}
