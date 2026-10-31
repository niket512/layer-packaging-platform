import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, FileText, Clock, MessageCircle, Truck, RefreshCw, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/snaplogo-orange.png";

const deliverables = [
  "A shortlist of trusted, high-quality contract manufacturers within 24 hours",
  "Apples-to-apples quotes comparison across price, MOQ, lead time, and all parameters",
  "Proactive updates on production, quality checks, delivery tracking, and payments",
];

const steps = [
  { icon: FileText, title: "Share the requirement", desc: "Product type, material, volume, target/current price, timeline." },
  { icon: Clock, title: "Matching within 24 hours", desc: "Standardized, side-by-side quotes within 1 business day." },
  { icon: MessageCircle, title: "Sampling & handshake", desc: "Shortlist, receive samples, and choose with full transparency." },
  { icon: Truck, title: "Post-order coordination", desc: "WhatsApp/email updates on production, quality, delivery, payment." },
  { icon: RefreshCw, title: "Reordering", desc: "Say the word — we handle the repeat." },
];

const terms = [
  { title: "Zero Commission", desc: "No additional cost for this pilot." },
  { title: "Confidentiality", desc: "Pricing, specs, and business details stay confidential." },
  { title: "No Exclusivity", desc: "Free to keep sourcing through other channels." },
];

export default function Proposal() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-content items-center justify-between px-5 md:px-8">
          <a href="/" className="flex items-center gap-2">
            <img src={logo} alt="Snaplogo" className="h-6 w-6 object-contain" />
            <span className="font-heading text-base font-bold tracking-tight text-foreground">Snaplogo</span>
          </a>
          <a href="mailto:contact@snapit.club" className="text-sm font-medium text-muted-foreground hover:text-primary">
            contact@snapit.club
          </a>
        </div>
      </header>

      {/* One-pager sheet */}
      <main className="flex-1 px-4 py-4 md:px-8 md:py-6">
        <article className="mx-auto max-w-[900px] overflow-hidden rounded-2xl border border-border bg-card shadow-sm card-soft">
          {/* Hero band */}
          <div className="bg-primary px-6 py-5 text-center md:px-10 md:py-6">
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-primary-foreground/80">Pilot Proposal</p>
            <h1 className="mx-auto mt-2 max-w-2xl font-heading text-[22px] font-semibold leading-tight tracking-tight text-primary-foreground md:text-[32px]">
              Your next packaging manufacturer, matched within 24 hours
            </h1>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-primary-foreground/90 md:text-[15px]">
              Simplify your packaging procurement with Snaplogo — a platform that matches you with the most relevant manufacturer within 24 hours, and streamlines your post-discovery journey from quote generation to order delivery
            </p>
          </div>

          <div className="space-y-5 px-5 py-5 md:px-10 md:py-6">
            {/* What You Get */}
            <section>
              <h2 className="font-heading text-base font-semibold tracking-tight text-foreground md:text-lg">What You Get</h2>
              <ul className="mt-3 grid gap-2 md:grid-cols-3">
                {deliverables.map((item, i) => (
                  <li key={i} className="flex gap-2.5 rounded-lg border border-border bg-muted/50 p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-[13px] leading-snug text-foreground">{item}</p>
                  </li>
                ))}
              </ul>
            </section>

            {/* How It Works */}
            <section>
              <h2 className="font-heading text-base font-semibold tracking-tight text-foreground md:text-lg">How It Works</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {steps.map((s, i) => (
                  <div key={i} className="rounded-lg border border-border bg-background p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary">
                      <s.icon className="h-4 w-4" />
                    </div>
                    <h3 className="mt-2 font-heading text-[13px] font-semibold text-foreground">{s.title}</h3>
                    <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{s.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Commercial Terms */}
            <section>
              <h2 className="font-heading text-base font-semibold tracking-tight text-foreground md:text-lg">Commercial Terms</h2>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {terms.map((t, i) => (
                  <div key={i} className="rounded-lg border border-border bg-muted/50 p-3">
                    <h3 className="font-heading text-[13px] font-semibold text-foreground">{t.title}</h3>
                    <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{t.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <section className="rounded-xl bg-primary px-5 py-5 text-center md:px-10">
              <div>
              <h3 className="font-heading text-lg font-semibold tracking-tight text-primary-foreground md:text-xl">
                Interested in the pilot?
              </h3>
              <Button
                onClick={() => navigate("/")}
                variant="secondary"
                className="mx-auto mt-4 h-11 rounded-full bg-background px-8 text-[12px] font-bold uppercase tracking-wider text-foreground hover:bg-background/90"
              >
                Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </section>
          </div>
        </article>

        {/* Contact strip */}
        <div className="mx-auto mt-3 flex max-w-[900px] items-center justify-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          <a href="mailto:contact@snapit.club" className="hover:text-primary">contact@snapit.club</a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex h-12 max-w-content items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Snaplogo" className="h-4 w-4 object-contain" />
            <span className="font-heading text-xs font-bold tracking-tight text-foreground">Snaplogo</span>
          </div>
          <p className="text-[11px] text-muted-foreground">© {new Date().getFullYear()} Snaplogo · Built for India's D2C ecosystem</p>
        </div>
      </footer>
    </div>
  );
}
