import { ArrowRight, Clock, Mail, MessageCircle, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/landing/Footer";
import logo from "@/assets/snaplogo-orange.png";

const WHATSAPP = "https://wa.me/917424960090?text=" + encodeURIComponent("Hi Snaplogo team, I'd like to talk about packaging sourcing.");

const principles = [
  { icon: Users, title: "A sourcing team, not a chatbot", desc: "Real people review every brief and match it with the right manufacturers." },
  { icon: ShieldCheck, title: "100+ vetted manufacturers", desc: "D2C-friendly factories we have checked and keep working with." },
  { icon: Clock, title: "Quotes within 4 hours", desc: "You hear back on WhatsApp with manufacturer details and quotations." },
];

export default function Team() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-content items-center justify-between px-5 md:px-8">
          <a href="/" className="flex items-center gap-2">
            <img src={logo} alt="Snaplogo" className="h-6 w-6 object-contain" />
            <span className="font-heading text-base font-bold tracking-tight text-foreground">Snaplogo</span>
          </a>
          <a href="/sourcing" className="text-sm font-medium text-muted-foreground hover:text-primary">Start a request</a>
        </div>
      </header>

      <main className="flex-1 px-5 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-content">
          <p className="text-xs font-semibold uppercase tracking-[1.5px] text-primary">The Snaplogo Team</p>
          <h1 className="mt-3 max-w-2xl font-heading text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            We match your packaging with the right manufacturer
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Snaplogo is a small team of sourcing specialists who help India's D2C brands find verified packaging manufacturers, compare quotations and run orders — all over WhatsApp, at zero commission.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild className="h-12 rounded-full px-7 text-[13px] font-bold uppercase tracking-wide">
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">Talk to our team <MessageCircle /></a>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-full px-7 text-[13px] font-bold uppercase tracking-wide">
              <a href="/sourcing">Start a sourcing request <ArrowRight /></a>
            </Button>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {principles.map(p => (
              <div key={p.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <p.icon className="h-6 w-6 text-primary" />
                <h2 className="mt-4 text-lg font-semibold text-foreground">{p.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-accent p-6 md:p-8">
            <h2 className="font-heading text-xl font-semibold text-foreground">Reach us directly</h2>
            <p className="mt-2 text-sm text-muted-foreground">The fastest way to reach the team is WhatsApp. We typically reply the same day.</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-medium text-primary hover:underline">
                <MessageCircle className="h-4 w-4" /> +91 74249 60090
              </a>
              <a href="mailto:contact@snapit.club" className="inline-flex items-center gap-2 font-medium text-primary hover:underline">
                <Mail className="h-4 w-4" /> contact@snapit.club
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
