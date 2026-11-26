import { Logo } from "@/components/brand/Logo";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SourcingBrief } from "@/components/sourcing/SourcingBrief";
import { readSaved } from "@/lib/sourcing";
import type { SourcingBriefField } from "../../supabase/functions/_shared/sourcing-intake";
import { consumeConversion, recordSourcingLead } from "@/lib/sourcing-conversion";
import { readRedditClickId } from "@/lib/reddit-attribution";
import { supabase } from "@/integrations/supabase/client";

const THANKYOU_KEY = "snaplogo.sourcing.thankyou";

interface ThankYouPayload {
  leadId: string;
  submissionId?: string;
  phone: string;
  brief: SourcingBriefField[];
}

/** Post-submission landing page — the URL used as the Google Ads conversion goal. */
export default function SourcingThankYou() {
  const [payload] = useState(() => readSaved<ThankYouPayload | null>(THANKYOU_KEY, null));
  const phone = payload?.phone?.trim() ?? "";
  const phoneDisplay = phone.startsWith("+") ? phone : phone ? `+91 ${phone}` : "";

  useEffect(() => {
    // Retain the displayed brief in memory, not a replayable saved confirmation.
    try { localStorage.removeItem(THANKYOU_KEY); } catch { /* Storage may be unavailable. */ }
    if (payload?.leadId && consumeConversion(payload.leadId) && recordSourcingLead(payload.leadId, true)) {
      (window as Window & { gtag?: (...args: unknown[]) => void }).gtag?.("event", "page_view", { page_path: "/sourcing/thank-you" });
      const w = window as Window & { rdt?: (...args: unknown[]) => void };
      w.rdt?.("track", "PageVisit");
      w.rdt?.("track", "Lead", { conversionId: payload.leadId });
      let clickId: string | undefined;
      try { clickId = readRedditClickId(localStorage); } catch { /* optional */ }
      if (payload.submissionId) {
        supabase.functions.invoke("reddit-capi", {
          body: { conversionId: payload.leadId, submissionId: payload.submissionId, clickId, screen: { width: screen.width, height: screen.height } },
        }).catch(() => { /* Pixel still records the lead. */ });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="theme-sourcing min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/80">
        <div className="mx-auto flex max-w-[900px] items-center px-5 py-4 md:px-10">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-[860px] px-5 py-10 md:px-10 md:py-14">
        <section className="sourcing-composer rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--sourcing-success))] text-white shadow-sm"><Check className="h-6 w-6" /></span>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold tracking-tight">Your sourcing brief is submitted</h1>
              {phoneDisplay && <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><span>We’ll message you on</span><span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-sm font-semibold text-foreground"><MessageSquare className="h-3.5 w-3.5 text-[hsl(var(--sourcing-success))]" />{phoneDisplay}</span></p>}
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Shortlisting from <span className="font-semibold text-foreground">40+ vetted manufacturers</span> — quotations <span className="font-semibold text-foreground">within 6 hours</span>.</p>
            </div>
          </div>
          <ol aria-label="What happens next" className="mt-8 grid gap-4 rounded-xl border border-border/70 bg-background/60 p-4 sm:grid-cols-3 md:p-5">{[[true, "Brief received", "With our sourcing team"], [false, "Manufacturer matching", "From 40+ vetted makers"], [false, "Quote on WhatsApp", "Details & pricing in 6 hrs"]].map(([done, label, sub], i) => <li key={label as string} className="flex items-start gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${done ? "border-transparent bg-[hsl(var(--sourcing-success))] text-white" : "border-border bg-card text-muted-foreground"}`}>{done ? <Check className="h-4 w-4" /> : i + 1}</span><span className="min-w-0"><span className="block text-sm font-semibold">{label}</span><span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{sub}</span></span></li>)}</ol>
          {payload && payload.brief.length > 0 && <SourcingBrief fields={payload.brief} submitted />}
          <a href="https://chat.whatsapp.com/I0vypMLz6bEKIeViw8rwh6" target="_blank" rel="noopener noreferrer" onClick={() => window.__lovableEvents?.track?.("project.whatsapp_group_opened", { placement: "thank_you" })} className="group mt-6 flex flex-col gap-3 rounded-2xl border border-[hsl(var(--sourcing-success)/0.25)] bg-[hsl(var(--sourcing-success)/0.06)] px-3.5 py-3 text-left transition-colors hover:bg-[hsl(var(--sourcing-success)/0.1)] sm:flex-row sm:items-center sm:gap-3 sm:px-5">
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--sourcing-success))] text-white"><MessageSquare className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-snug text-foreground sm:text-[15px]">While you wait — join the Brands and Manufacturers Group</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--sourcing-success))]" />100+ Brands · 20+ Manufacturers</span>
              </span>
            </span>
            <span className="flex h-9 w-full shrink-0 items-center justify-center gap-1 rounded-full bg-[hsl(var(--sourcing-success))] px-4 text-xs font-bold uppercase tracking-wide text-white sm:w-auto"><span className="sm:hidden">Join free on WhatsApp</span><span className="hidden sm:inline">Join WhatsApp community</span><ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
          </a>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="rounded-full sm:flex-none"><Link to="/"><Plus />New sourcing request</Link></Button>
          </div>
        </section>
      </main>
    </div>
  );
}
