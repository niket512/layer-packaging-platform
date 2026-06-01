import { useState, useEffect } from "react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
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
    const handler = () => setShowForm(true);
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
    setTimeout(() => {
      document.getElementById("cta-brand")?.focus();
    }, 50);
  };

  return (
    <section
      ref={ref}
      id="request-access"
      className="relative overflow-hidden py-20 md:py-28"
      style={{
        backgroundImage:
          "linear-gradient(135deg, hsl(252 75% 25% / 0.55), hsl(240 20% 5%) 70%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 gradient-mesh opacity-60" />

      <div className="relative mx-auto max-w-content px-6 text-center">
        {submitted ? (
          <div className={isVisible ? "animate-reveal-scale" : "opacity-0"}>
            <CheckCircle2 className="mx-auto h-12 w-12 text-secondary" />
            <h2 className="mt-4 font-heading text-3xl font-semibold text-foreground">We'll be in touch</h2>
            <p className="mt-2 text-base text-muted-foreground">Thanks for your interest. Our team will reach out shortly.</p>
          </div>
        ) : (
          <div className={isVisible ? "animate-reveal-up" : "opacity-0"}>
            <h2 className="mx-auto max-w-2xl font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Ready to source smarter?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
              Join early-access brands already using Snaplogo for packaging procurement.
            </p>

            {!showForm ? (
              <>
                <div className="mt-8 flex justify-center">
                  <Button variant="invert" size="pill" onClick={() => setShowForm(true)}>
                    Get Early Access
                  </Button>
                </div>

                <form onSubmit={handleQuickSubmit} className="mx-auto mt-6 flex max-w-md gap-2">
                  <input
                    type="email"
                    required
                    value={quickEmail}
                    onChange={(e) => setQuickEmail(e.target.value)}
                    placeholder="your@brand.com"
                    className="h-12 w-full rounded-full border border-border bg-card px-5 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                  />
                  <Button type="submit" variant="hero" size="pill">
                    Submit
                  </Button>
                </form>
              </>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mx-auto mt-10 max-w-md space-y-3 rounded-2xl border border-border bg-card p-6 text-left animate-reveal-up"
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
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground"
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
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground"
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
                    className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground"
                    placeholder="e.g. 5,000 stand-up pouches for a snacks launch..."
                  />
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full gap-2" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit request"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
