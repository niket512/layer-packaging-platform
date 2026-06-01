import { useState } from "react";
import { ArrowRight } from "lucide-react";

const openForm = (email?: string) => {
  document.getElementById("sign-up")?.scrollIntoView({ behavior: "smooth" });
  window.dispatchEvent(new CustomEvent("open-access-form", { detail: { email } }));
};

export default function HeroSection() {
  const [email, setEmail] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openForm(email);
  };

  return (
    <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 hero-bloom">
      <div className="relative mx-auto max-w-content px-6 text-center">
        <h1 className="font-heading text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-[56px]">
          <span className="text-foreground">Source </span>
          <span className="text-primary">Smarter.</span>{" "}
          <span className="text-primary">Faster.</span>{" "}
          <span className="text-primary">Better.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-[580px] text-lg text-muted-foreground md:text-xl">
          The procurement platform built for D2C brands — verified manufacturers, seamless coordination, and full order visibility.
        </p>

        <form
          onSubmit={onSubmit}
          className="mx-auto mt-10 flex w-full max-w-md items-center rounded-full border border-primary/40 bg-background p-1.5 shadow-[0_2px_16px_rgba(37,99,235,0.08)] focus-within:border-primary"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@brand.com"
            className="h-10 flex-1 bg-transparent px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-[13px] font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign Up <ArrowRight className="h-4 w-4" />
          </button>
        </form>
        <p className="mt-3 text-xs text-muted-foreground">Trusted by emerging D2C brands in FMCG</p>
      </div>
    </section>
  );
}
