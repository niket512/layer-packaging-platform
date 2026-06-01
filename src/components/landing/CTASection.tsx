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

  // Auto-open form when triggered from other sections
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
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setSubmitted(true);
  };

  return (
    <section ref={ref} id="request-access" className="bg-muted/40 py-16 md:py-20">
      <div className="container">
        <div
          className={`mx-auto max-w-2xl rounded-3xl border border-border bg-surface-raised p-10 text-center shadow-lg shadow-primary/5 md:p-16 ${isVisible ? "animate-reveal-scale" : "opacity-0"}`}
        >
          {submitted ? (
            <div className="py-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
              <h2 className="mt-4 font-heading text-2xl font-bold text-heading">We'll be in touch</h2>
              <p className="mt-2 text-sm text-body">
                Thanks for your interest. Our team will reach out shortly.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary normal-case">Register with us</p>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-heading text-balance sm:text-4xl">
                Built for D2C brands, startups & SMEs
              </h2>
              <p className="mx-auto mt-4 max-w-md text-body text-pretty">
                Share your details and our team will reach out to onboard you onto Snaplogo.
              </p>

              {!showForm ? (
                <Button
                  variant="hero"
                  size="xl"
                  className="mt-8"
                  onClick={() => setShowForm(true)}
                >
                  Register with us
                </Button>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="mx-auto mt-8 max-w-md space-y-3 text-left animate-reveal-up"
                >
                  <div>
                    <label htmlFor="cta-brand" className="mb-1.5 block text-sm font-medium text-heading">
                      Brand name <span className="text-primary">*</span>
                    </label>
                    <input
                      id="cta-brand"
                      type="text"
                      required
                      maxLength={100}
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-heading outline-none transition-shadow focus:ring-2 focus:ring-ring/40 placeholder:text-body-muted"
                      placeholder="Your brand name"
                    />
                  </div>
                  <div>
                    <label htmlFor="cta-email" className="mb-1.5 block text-sm font-medium text-heading">
                      Email <span className="text-primary">*</span>
                    </label>
                    <input
                      id="cta-email"
                      type="email"
                      required
                      maxLength={255}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-heading outline-none transition-shadow focus:ring-2 focus:ring-ring/40 placeholder:text-body-muted"
                      placeholder="you@brand.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="cta-requirement" className="mb-1.5 block text-sm font-medium text-heading">
                      What do you need? <span className="text-primary">*</span>
                    </label>
                    <textarea
                      id="cta-requirement"
                      required
                      maxLength={1000}
                      rows={3}
                      value={requirement}
                      onChange={(e) => setRequirement(e.target.value)}
                      className="w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-heading outline-none transition-shadow focus:ring-2 focus:ring-ring/40 placeholder:text-body-muted leading-relaxed"
                      placeholder="e.g. 5,000 mailer boxes for a skincare launch..."
                    />
                  </div>
                  <Button type="submit" variant="hero" size="lg" className="w-full gap-2" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit request"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
