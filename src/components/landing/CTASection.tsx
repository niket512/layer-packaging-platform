import { useState, useEffect } from "react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function CTASection() {
  const { ref, isVisible } = useScrollReveal();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [brand, setBrand] = useState("");
  const [email, setEmail] = useState("");
  const [requirement, setRequirement] = useState("");
  const [quickEmail, setQuickEmail] = useState("");

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { email?: string; requirement?: string } | undefined;
      if (detail?.email) {
        setEmail(detail.email);
        setQuickEmail(detail.email);
      }
      if (detail?.requirement) {
        setRequirement(detail.requirement);
      }
      setShowForm(true);
      setTimeout(() => document.getElementById("cta-brand")?.focus(), 80);
    };
    window.addEventListener("open-access-form", handler);
    return () => window.removeEventListener("open-access-form", handler);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !brand.trim() || !requirement.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("access_requests").insert({
      brand: brand.trim(),
      email: email.trim(),
      requirement: requirement.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
      return;
    }
    setSubmitted(true);
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail(quickEmail);
    setShowForm(true);
    setTimeout(() => document.getElementById("cta-brand")?.focus(), 50);
  };

  return (
    <section
      ref={ref}
      id="sign-up"
      className="bg-primary py-16 md:py-24"
    >
      <div className="mx-auto max-w-content px-6 text-center">
        {submitted ? (
          <div className={isVisible ? "animate-reveal-up" : "opacity-0"}>
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary-foreground" />
            <h2 className="mt-4 font-heading text-3xl font-semibold text-primary-foreground">We'll be in touch</h2>
            <p className="mt-2 text-base text-primary-foreground/80">Thanks for signing up. Our team will reach out shortly.</p>
          </div>
        ) : (
          <div className={isVisible ? "animate-reveal-up" : "opacity-0"}>
            <h2 className="mx-auto max-w-2xl font-heading text-[32px] font-semibold tracking-tight text-primary-foreground md:text-[38px]">
              Start sourcing smarter today
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/80 md:text-lg">
              Join D2C brands already using Snaplogo to find better manufacturers and ship faster.
            </p>

            {!showForm ? (
              <>
                <form onSubmit={handleQuickSubmit} className="mx-auto mt-8 flex w-full max-w-md items-center rounded-full bg-background p-1.5 shadow-md">
                  <input
                    type="email"
                    required
                    value={quickEmail}
                    onChange={(e) => setQuickEmail(e.target.value)}
                    placeholder="your@brand.com"
                    className="h-10 flex-1 bg-transparent px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-[13px] font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-[#1D4ED8]"
                  >
                    Sign Up <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
                <p className="mt-3 text-xs text-primary-foreground/70">No credit card required. Free to get started.</p>
              </>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mx-auto mt-8 max-w-md space-y-3 rounded-2xl bg-background p-6 text-left card-soft"
              >
                <div>
                  <label htmlFor="cta-brand" className="mb-1.5 block text-sm font-medium text-foreground">
                    Brand name <span className="text-primary">*</span>
                  </label>
                  <input
                    id="cta-brand"
                    type="text"
                    required
                    maxLength={100}
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                    placeholder="Your brand name"
                  />
                </div>
                <div>
                  <label htmlFor="cta-email" className="mb-1.5 block text-sm font-medium text-foreground">
                    Email <span className="text-primary">*</span>
                  </label>
                  <input
                    id="cta-email"
                    type="email"
                    required
                    maxLength={255}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                    placeholder="you@brand.com"
                  />
                </div>
                <div>
                  <label htmlFor="cta-requirement" className="mb-1.5 block text-sm font-medium text-foreground">
                    What do you need? <span className="text-primary">*</span>
                  </label>
                  <textarea
                    id="cta-requirement"
                    required
                    maxLength={1000}
                    rows={3}
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                    placeholder="e.g. 5,000 stand-up pouches for a snacks launch..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-[13px] font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-[#1D4ED8] disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
