import { useState } from "react";
import { ArrowRight, CheckCircle2, Clock, FileText, Shield, Truck, MessageCircle, RefreshCw, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/snaplogo-orange.png";

const deliverables = [
  "A shortlist of trusted and high quality contract manufacturers within 24 hours",
  "Apples-to-apples quotes comparison based on price, MOQ, lead time, and all other parameters",
  "Proactive updates on production timelines, quality check reports, delivery tracking, and payment",
];

const steps = [
  { icon: FileText, title: "Share the requirement", desc: "Product type, material, volume, target price, current price, and timeline." },
  { icon: Clock, title: "Matching within 24 hours", desc: "Side-by-side standardized quotes from shortlisted manufacturers within 1 business day." },
  { icon: CheckCircle2, title: "Sampling", desc: "Shortlist manufacturers and receive samples to evaluate quality." },
  { icon: MessageCircle, title: "Handshake", desc: "Choose a manufacturer; we introduce you with complete transparency." },
  { icon: Truck, title: "Post-order coordination", desc: "Updates on production, quality checks, delivery, and payment via WhatsApp or email." },
  { icon: RefreshCw, title: "Reordering", desc: "Say the word — we handle the repeat." },
];

const terms = [
  { title: "Zero Commission", desc: "No additional cost for this pilot." },
  { title: "Confidentiality", desc: "Pricing, specs, and business details stay confidential." },
  { title: "No Exclusivity", desc: "You are free to keep sourcing through other channels during the pilot." },
];

export default function Proposal() {
  const [email, setEmail] = useState("");
  const [brand, setBrand] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !brand.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("access_requests").insert({
      brand: brand.trim(),
      email: email.trim(),
      requirement: "Proposal page interest",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "Interest recorded", description: "We will reach out within 24 hours." });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-5 md:px-8">
          <a href="/" className="flex items-center gap-2">
            <img src={logo} alt="Snaplogo" className="h-7 w-7 object-contain" />
            <span className="font-heading text-lg font-bold tracking-tight text-foreground">Snaplogo</span>
          </a>
          <a href="mailto:contact@snapit.club" className="text-sm font-medium text-muted-foreground hover:text-primary">
            contact@snapit.club
          </a>
        </div>
      </header>

      {/* Proposal Sheet */}
      <main className="mx-auto max-w-[860px] px-5 py-8 md:py-12">
        <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm card-soft">
          {/* Top band */}
          <div className="bg-primary px-6 py-8 text-center md:px-10 md:py-10">
            <p className="text-xs font-semibold uppercase tracking-[1.5px] text-primary-foreground/80">Pilot Proposal</p>
            <h1 className="mx-auto mt-3 max-w-2xl font-heading text-[26px] font-semibold leading-tight tracking-tight text-primary-foreground md:text-[38px]">
              Your next packaging manufacturer, matched within 24 hours
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-primary-foreground/90 md:text-base">
              Simplify your packaging procurement with Snaplogo — a platform that matches you with the most relevant manufacturer within 24 hours, and streamlines your post-discovery journey from quote generation to order delivery
            </p>
          </div>

          <div className="space-y-8 px-6 py-8 md:px-10 md:py-10">
            {/* What You Get */}
            <section>
              <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl">What You Get</h2>
              <ul className="mt-4 grid gap-3 md:grid-cols-3">
                {deliverables.map((item, i) => (
                  <li key={i} className="flex gap-3 rounded-xl border border-border bg-muted/50 p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <p className="text-sm leading-relaxed text-foreground">{item}</p>
                  </li>
                ))}
              </ul>
            </section>

            {/* How It Works */}
            <section>
              <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl">How It Works</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {steps.map((s, i) => (
                  <div key={i} className="flex gap-4 rounded-xl border border-border bg-background p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-semibold text-foreground">{s.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Commercial Terms */}
            <section>
              <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl">Commercial Terms</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {terms.map((t, i) => (
                  <div key={i} className="flex-1 min-w-[220px] rounded-xl border border-border bg-muted/50 p-4">
                    <h3 className="font-heading text-sm font-semibold text-foreground">{t.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <section className="rounded-2xl bg-primary px-6 py-8 text-center md:px-10">
              {submitted ? (
                <div>
                  <CheckCircle2 className="mx-auto h-10 w-10 text-primary-foreground" />
                  <h3 className="mt-3 font-heading text-xl font-semibold text-primary-foreground">We will be in touch within 24 hours</h3>
                  <p className="mt-1 text-sm text-primary-foreground/80">Thanks for your interest</p>
                </div>
              ) : (
                <>
                  <h3 className="font-heading text-xl font-semibold tracking-tight text-primary-foreground md:text-2xl">
                    Interested in the pilot?
                  </h3>
                  <p className="mt-2 text-sm text-primary-foreground/80">Share your email and we will get started</p>
                  <form onSubmit={handleSubmit} className="mx-auto mt-5 flex w-full max-w-md flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      required
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Brand name"
                      className="h-12 flex-1 rounded-full border-0 bg-primary-foreground px-5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@brand.com"
                      className="h-12 flex-1 rounded-full border-0 bg-primary-foreground px-5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    <Button
                      type="submit"
                      disabled={submitting}
                      variant="secondary"
                      className="h-12 rounded-full bg-background px-6 text-[13px] font-bold uppercase tracking-wider text-foreground hover:bg-background/90 disabled:opacity-60"
                    >
                      {submitting ? "Submitting..." : "Get Started"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </>
              )}
            </section>
          </div>
        </article>

        {/* Contact strip */}
        <div className="mt-6 flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground md:flex-row md:gap-8">
          <a href="mailto:contact@snapit.club" className="flex items-center gap-2 hover:text-primary">
            <Mail className="h-4 w-4" /> contact@snapit.club
          </a>
          <a href="tel:+919999999999" className="flex items-center gap-2 hover:text-primary">
            <Phone className="h-4 w-4" /> +91 99999 99999
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Snaplogo" className="h-5 w-5 object-contain" />
            <span className="font-heading text-sm font-bold tracking-tight text-foreground">Snaplogo</span>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Snaplogo · Built for India's D2C ecosystem</p>
        </div>
      </footer>
    </div>
  );
}
