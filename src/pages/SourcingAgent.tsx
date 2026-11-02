import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftRight, ArrowRight, ArrowUp, Check, ChevronRight, Loader2, ImagePlus, MessageSquare, Plus, ShieldCheck, User, Users, X, Zap, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CorrugatedDesigns } from "@/components/sourcing/CorrugatedDesigns";
import { designReferenceImage } from "@/components/sourcing/design-reference-image";
import { DESIGN_PREFILL_KEY } from "@/pages/Designs";
import type { PackagingDesign } from "@/components/sourcing/packaging-catalogue";
import { SourcingBrief } from "@/components/sourcing/SourcingBrief";
import { supabase } from "@/integrations/supabase/client";
import { looksLikeSourcingPhone, mergeSourcingBrief, sourcingProjectTitle, needsSourcingDesign, recordSourcingFollowUp, readSourcingStream, readSaved, sourcingRequest, sourcingSubmission, validSourcingPhone, validatedQuestions, type SourcingProject, type SourcingQuestion } from "@/lib/sourcing";
import { imageFileToDataUrl } from "@/lib/image-data-url";
import { syncSourcingChat } from "@/lib/chat-monitoring";
import { trackFunnel, flushVisitorTracking } from "@/lib/visitor-tracking";
import logo from "@/assets/snaplogo-orange.png";
import type { IntakeReply } from "../../supabase/functions/_shared/sourcing-intake";

const PROJECTS_KEY = "snaplogo.sourcing.projects";
const TEAM_WHATSAPP = "https://wa.me/917424960090?text=" + encodeURIComponent("Hi Snaplogo! I'd like to talk to a sourcing expert about my packaging requirement.");

const TEMPLATE = "I need [quantity] custom [box / pouch type] for my [product] brand — size [L×W×H cm], [material, e.g. 3-ply kraft], [printing, e.g. multicolour logo], budget ₹[price] per piece";

export type SourcingCategory = "corrugated-boxes" | "flexible-pouches" | "sachets" | "cosmetic-packaging" | "mailer-boxes";
const LANDINGS: Record<SourcingCategory, { headline: string; copy: string; cta: string }> = {
  "corrugated-boxes": {
    headline: "Find Corrugated Box Manufacturers for Your Business",
    copy: "Get matched with vetted manufacturers for your required box size, board grade, printing and order quantity.",
    cta: "Get Corrugated Box Quotes",
  },
  "flexible-pouches": {
    headline: "Find Flexible Pouch Manufacturers for Your Brand",
    copy: "Source custom printed stand-up pouches, zipper pouches and other flexible packaging formats.",
    cta: "Get Pouch Quotes",
  },
  "sachets": {
    headline: "Find Sachet & Stick Pack Manufacturers for Your Brand",
    copy: "Source custom printed sachets, stick packs and single-serve flexible packaging from vetted manufacturers.",
    cta: "Get Sachet Quotes",
  },
  "cosmetic-packaging": {
    headline: "Find Cosmetic Packaging Manufacturers for Your Brand",
    copy: "Source bottles, jars, tubes and boxes for skincare and beauty products from vetted manufacturers.",
    cta: "Get Cosmetic Packaging Quotes",
  },
  "mailer-boxes": {
    headline: "Find Mailer Box Manufacturers for Your Brand",
    copy: "Get matched with vetted manufacturers for custom printed mailer and e-commerce shipping boxes.",
    cta: "Get Mailer Box Quotes",
  },
};
const SUGGESTIONS: { label: string; phrase: string }[] = [
  { label: "Corrugated Boxes", phrase: "I need corrugated boxes" },
  { label: "Flexible Pouches", phrase: "I need flexible pouches" },
  { label: "Sachets", phrase: "I need sachets" },
  { label: "Bottles", phrase: "I need bottles or jars" },
];

export default function SourcingAgent({ category }: { category?: SourcingCategory } = {}) {
  const landing = category ? LANDINGS[category] : undefined;
  const navigate = useNavigate();
  const [projects, setProjects] = useState<SourcingProject[]>(() => {
    const saved = readSaved<unknown>(PROJECTS_KEY, []);
    return Array.isArray(saved) ? saved.filter(p => p && typeof p.id === "string" && typeof p.title === "string" && Array.isArray(p.turns)) : [];
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [historyOpen, setHistoryOpen] = useState(true);
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pendingQuery, setPendingQuery] = useState("");
  const [liveQuestions, setLiveQuestions] = useState<SourcingQuestion[]>([]);
  const [liveMessage, setLiveMessage] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const project = projects.find(p => p.id === activeId);
  useEffect(() => {
    if (!project) return;
    void syncSourcingChat(project).catch(() => { /* Local history remains available; retry below. */ });
    const retry = window.setInterval(() => void syncSourcingChat(project).catch(() => {}), 15000);
    return () => window.clearInterval(retry);
  }, [project]);
  const turns = project?.turns ?? [];
  const current = turns.at(-1);
  const hasQuestions = !current?.questionsSkipped && (current?.questions?.length ?? 0) > 0;
  const askingPhone = !!current && !hasQuestions && !project?.submitted && (current.stage ? current.stage === "phone" || current.stage === "design" : true);
  const designStep = askingPhone && !!project && needsSourcingDesign(project);
  useEffect(() => {
    if (!current || busy || submitting || project?.submitted) return;
    if (hasQuestions) trackFunnel("questions_shown");
    if (designStep) trackFunnel("design_shown");
    if (askingPhone && !designStep) { trackFunnel("brief_shown"); trackFunnel("contact_shown"); }
  }, [current, busy, submitting, project?.submitted, hasQuestions, designStep, askingPhone]);
  const addPhotos = async (files: FileList | null) => {
    if (!files) return;
    try {
      const next = await Promise.all(Array.from(files).slice(0, 4 - photos.length).map(f => imageFileToDataUrl(f)));
      setPhotos(prev => [...prev, ...next].slice(0, 4));
    } catch (e) { setError(e instanceof Error ? e.message : "Couldn’t add that photo."); }
    if (fileInput.current) fileInput.current.value = "";
  };

  useEffect(() => { try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects)); } catch { /* Keep session usable. */ } }, [projects]);
  useEffect(() => {
    let raw: string | null = null;
    try { raw = sessionStorage.getItem(DESIGN_PREFILL_KEY); sessionStorage.removeItem(DESIGN_PREFILL_KEY); } catch { /* Ignore. */ }
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as { prefill?: string; designs?: PackagingDesign[] };
      if (saved.prefill) { setQuery(previous => previous.trim() ? `${previous}\n\n${saved.prefill}` : saved.prefill); setError(""); }
      if (saved.designs?.length) void designReferenceImage(saved.designs).then(image => setPhotos(previous => [...previous, image].slice(0, 4))).catch(e => setError(e instanceof Error ? e.message : "Couldn’t attach the design reference."));
      input.current?.focus();
    } catch { /* Ignore malformed saved prefill. */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!project || busy || submitting) return;
    const updated = recordSourcingFollowUp(project);
    if (updated !== project) setProjects(prev => prev.map(p => p.id === project.id ? updated : p));
  }, [project, busy, submitting]);
  const chatAnchor = useRef<HTMLDivElement>(null);
  const chatShown = useRef(false);
  useEffect(() => {
    if ((current || busy) && !chatShown.current) {
      chatShown.current = true;
      requestAnimationFrame(() => chatAnchor.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
    if (!current && !busy) chatShown.current = false;
  }, [current, busy]);

  const startNew = () => { if (busy || submitting) return; setActiveId(null); setQuery(""); setPhotos([]); setError(""); input.current?.focus(); };
  const search = async (text = query) => {
    const trimmed = text.trim() || (photos.length ? "Photos attached" : "");
    if (askingPhone && !designStep && validSourcingPhone(trimmed)) { void submitPhone(trimmed); return; }
    if (askingPhone && !designStep && looksLikeSourcingPhone(trimmed)) { setError("That doesn’t look like a valid WhatsApp number. Please share a 10-digit number, e.g. 98765 43210."); return; }
    if (!trimmed || busy || submitting || project?.submitted) return;
    if (!turns.length) trackFunnel("first_message");
    setBusy(true); setError(""); setPendingQuery(trimmed); setLiveQuestions([]); setLiveMessage("");
    const id = activeId ?? crypto.randomUUID();
    // Save sent messages even when the assistant is interrupted or the visitor leaves.
    void syncSourcingChat({ ...(project ?? { id, title: trimmed.slice(0, 65), turns: [] }), turns: [...turns, { query: trimmed, matches: [], images: photos }] }).catch(() => {});
    try {
      let questions: unknown = [];
      let reply: IntakeReply | undefined;
      {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/directory-search`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
          body: JSON.stringify({ query: sourcingRequest(turns, trimmed), latest: trimmed, images: photos, brief: project?.brief ?? [], mode: "intake", stream: true, conversational: true, quotationAsked: turns.some(t => t.stage === "quotation" || (t.questions?.length ?? 0) > 0), currentStage: current?.stage ?? (hasQuestions ? "quotation" : designStep ? "design" : askingPhone ? "phone" : "clarify"), conversation: turns.map(t => ({ request: t.query, response: t.assistantMessage, stage: t.stage, questions: t.questions ?? [], followUp: t.followUp, hasImages: (t.images?.length ?? 0) > 0, skipped: t.questionsSkipped ?? false })) }),
        });
        questions = await readSourcingStream(response, value => setLiveQuestions(turns.some(t => t.stage === "quotation" || (t.questions?.length ?? 0) > 0) ? [] : validatedQuestions(value, turns)), value => { reply = value; }, setLiveMessage);
      }
      const turn = { query: trimmed, matches: [], questions: turns.some(t => t.stage === "quotation" || (t.questions?.length ?? 0) > 0) ? [] : validatedQuestions(questions, turns), images: photos, assistantMessage: reply?.message, stage: reply?.stage ?? "clarify" as const, hasRequirement: reply?.hasRequirement ?? false };
      if (hasQuestions && reply?.stage && reply.stage !== "quotation" && reply.stage !== "clarify") trackFunnel(trimmed === "Skip the optional quotation details for now; use my packaging requirement." ? "questions_skipped" : "questions_answered");
      if (designStep && reply?.stage === "phone") trackFunnel("design_answered");
      setProjects(prev => prev.some(p => p.id === id) ? prev.map(p => p.id === id ? { ...p, brief: mergeSourcingBrief(p.brief, reply?.brief), designDone: p.designDone || reply?.stage === "phone", turns: [...p.turns, turn] } : p) : [{ id, title: trimmed.slice(0, 65), createdAt: new Date().toISOString(), brief: mergeSourcingBrief([], reply?.brief), turns: [turn] }, ...prev]);
      setActiveId(id); setQuery(""); setPhotos([]);
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Please try again."); }
    finally { setBusy(false); setPendingQuery(""); setLiveQuestions([]); setLiveMessage(""); }
  };
  const submitPhone = async (phone: string) => {
    const draft = { query: validSourcingPhone(query.trim()) ? "" : query, images: photos };
    const payload = sourcingSubmission(turns, phone, draft, project?.brief);
    if (!payload || busy || submitting || project?.submitted) return;
    trackFunnel("contact_submitted");
    setSubmitting(true); setError("");
    try {
      const submissionId = crypto.randomUUID();
      const { error: insertError } = await supabase.from("requirement_submissions").insert({ ...payload, id: submissionId });
      if (insertError) throw new Error("Your request couldn’t be sent. Please try again.");
      trackFunnel("request_saved");
      void flushVisitorTracking();
      const phoneDisplay = phone.trim().startsWith("+") ? phone.trim() : `+91 ${phone.trim()}`;
      if (project) {
        const submittedProject = { ...project, submitted: true, submissionId, phone: phone.trim(), turns: [...project.turns, { query: phoneDisplay, matches: [], images: draft.images }, ...(draft.query.trim() ? [{ query: draft.query.trim(), matches: [] }] : [])] };
        await syncSourcingChat(submittedProject).catch(() => {});
        setProjects(prev => prev.map(p => p.id === activeId ? submittedProject : p));
      }
      setQuery(""); setPhotos([]);
      try { localStorage.setItem("snaplogo.sourcing.thankyou", JSON.stringify({ leadId: activeId ?? crypto.randomUUID(), phone: phone.trim(), brief: project?.brief ?? [] })); } catch { /* Confirmation still works without the saved brief. */ }
      navigate("/sourcing/thank-you");
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); }
    finally { setSubmitting(false); }
  };
  const composer = (compact = false) => (
    <form onSubmit={e => { e.preventDefault(); void search(); }} className={`sourcing-composer rounded-2xl border border-border bg-card p-2.5 sm:p-4 focus-within:ring-2 focus-within:ring-primary/20 ${compact ? "" : "mt-3 md:mt-5"}`}>
      <label htmlFor="sourcing-query" className="sr-only">{compact ? "Your answer" : "Packaging requirement"}</label>
      <textarea ref={input} id="sourcing-query" value={query} onChange={e => setQuery(e.target.value)} maxLength={500} disabled={busy || submitting} rows={compact ? 3 : 3} placeholder={designStep ? "Share a design or photo, or say you don’t have one…" : askingPhone ? "Your WhatsApp number, e.g. 98765 43210" : compact ? "Your answer, or any other details…" : "Describe what you need (e.g. 5,000 coffee boxes, 3-ply kraft, logo print)…"} className="w-full resize-none bg-transparent px-1 pt-1 text-base leading-relaxed sm:px-2 sm:pt-2 text-foreground outline-none placeholder:text-muted-foreground" onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void search(); } }} />
      {photos.length > 0 && <div className="flex flex-wrap gap-2 px-2 pt-2">{photos.map((src, i) => <div key={i} className="relative"><img src={src} alt={`Attached photo ${i + 1}`} className="h-16 w-16 rounded-lg border border-border object-cover" /><button type="button" aria-label="Remove photo" onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background"><X className="h-3 w-3" /></button></div>)}</div>}
      <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2.5"><div className="flex items-center gap-1"><input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={e => void addPhotos(e.target.files)} /><Button type="button" variant="ghost" size="sm" disabled={busy || submitting || photos.length >= 4} onClick={() => fileInput.current?.click()} className="h-10 px-2 text-xs text-muted-foreground sm:text-sm"><ImagePlus /><span className="sm:hidden">Add photo</span><span className="hidden sm:inline">Add design / photos</span></Button>{!compact && <Button type="button" variant="ghost" size="sm" disabled={busy || submitting} onClick={() => { setQuery(TEMPLATE); input.current?.focus(); }} className="h-10 px-2 text-xs text-muted-foreground sm:text-sm"><Zap /><span className="sm:hidden">Template</span><span className="hidden sm:inline">Use template</span></Button>}</div><Button type="submit" size="icon" disabled={busy || submitting || (!query.trim() && !photos.length)} aria-label="Send answer" className="h-10 w-10 rounded-full shadow-sm disabled:opacity-100 disabled:bg-primary/70">{busy ? <Loader2 className="animate-spin" /> : <ArrowUp />}</Button></div>
    </form>
  );
  return (
    <div className="theme-sourcing min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
        <Link to="/sourcing" className="flex items-center gap-2 px-2 text-xl font-bold"><img src={logo} alt="" className="h-8 w-8" />snaplogo<span className="text-primary">.</span></Link>
        <Button onClick={startNew} disabled={busy || submitting} className="mt-8 w-full justify-start rounded-full shadow-sm"><Plus />New sourcing request</Button>
        {projects.length > 0 && <button type="button" onClick={() => setHistoryOpen(o => !o)} aria-expanded={historyOpen} className="mt-8 flex w-full items-center justify-between px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">Previous requests<ChevronRight className={`h-3.5 w-3.5 transition-transform ${historyOpen ? "rotate-90" : ""}`} /></button>}
        <div className={`mt-2 flex-1 space-y-0.5 overflow-y-auto ${historyOpen ? "" : "hidden"}`} >{projects.map(p => <button type="button" key={p.id} disabled={busy || submitting} onClick={() => { setActiveId(p.id); setPhotos([]); setQuery(""); setError(""); }} className={`block w-full rounded-lg border-l-2 px-3 py-2.5 text-left transition-colors duration-150 disabled:opacity-60 ${p.id === activeId ? "border-primary bg-accent" : "border-transparent hover:bg-muted"}`}><span className="block truncate text-[13px] font-medium text-foreground" title={sourcingProjectTitle(p)}>{sourcingProjectTitle(p)}</span><span className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground"><span className={`rounded-full px-2 py-px text-[10px] font-semibold ${p.submitted ? "bg-[hsl(var(--sourcing-success)/0.12)] text-[hsl(var(--sourcing-success))]" : "bg-muted text-muted-foreground"}`}>{p.submitted ? "Submitted" : "Draft"}</span>{p.createdAt && new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></button>)}</div>
      </aside>
      <div className="lg:ml-60">
        <header className="sticky top-0 z-10 flex h-12 items-center justify-between gap-2 border-b border-border bg-card/90 px-4 backdrop-blur md:h-16 md:px-10">
          <nav aria-label="Sections" className="flex items-center gap-1 text-sm"><Link to="/sourcing" className="mr-2 flex items-center gap-2 font-bold lg:hidden"><img src={logo} alt="" className="h-6 w-6" />snaplogo<span className="text-primary">.</span></Link><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hidden rounded-full bg-muted px-3 py-1.5 font-medium sm:inline">Workspace</button><button type="button" onClick={() => { if (current) startNew(); setTimeout(() => document.getElementById("browse-designs")?.scrollIntoView({ behavior: "smooth" }), 50); }} className="hidden rounded-full px-3 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground sm:inline">Browse designs</button></nav>
          <div className="flex items-center gap-1.5 sm:gap-2"><Button onClick={startNew} disabled={busy || submitting} size="sm" aria-label="New sourcing request" className="h-8 rounded-full px-3 text-xs sm:h-9 sm:px-4 sm:text-sm lg:hidden"><Plus /><span>New Request</span></Button></div>
        </header>
        <main className="mx-auto max-w-[1000px] px-4 pb-12 md:px-10">
          {!current && !busy && <div className="mx-auto pb-4 pt-4 text-center sm:pt-6 md:pt-10">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold text-muted-foreground shadow-sm"><Sparkles className="h-3.5 w-3.5 text-primary" />AI Sourcing Engine</p>
            <h1 className="mx-auto mt-2 max-w-[760px] max-sm:max-w-[360px] text-[28px] font-bold leading-8 tracking-normal sm:text-[32px] sm:leading-[1.15] md:text-[52px]">Find custom packaging manufacturers</h1>
            <p className="mx-auto mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">Corrugated box manufacturers, stand-up pouch manufacturers &amp; sachet manufacturers for your D2C brand.</p>
            <ul className="mx-auto mt-3 grid max-w-[860px] grid-cols-3 divide-x divide-border rounded-full border border-border bg-card px-2 py-1.5 shadow-sm sm:mt-5 sm:px-6 sm:py-2">{([["24h Quotes", Zap], ["100+ Vetted Suppliers", Handshake], ["0% Commission", ShieldCheck]] as const).map(([t, Icon]) => <li key={t} className="flex min-w-0 items-center justify-center gap-1 px-1 py-0.5 text-[11px] font-semibold text-foreground sm:gap-1.5 sm:text-sm"><Icon className="h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4" /><span className="leading-tight">{t}</span></li>)}</ul>
            <div className="mx-auto max-w-[860px] text-left">{composer()}</div>
            <ol aria-label="How it works" className="mx-auto mt-4 hidden max-w-[860px] items-center justify-center gap-1.5 sm:flex">{["Describe", "Get matched", "Quotes in 24h"].map((t, i) => <li key={t} className="flex items-center gap-1"><span className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${i === 0 ? "text-foreground" : "text-muted-foreground"}`}><span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>{t}</span>{i < 2 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}</li>)}</ol>
            <section aria-labelledby="why-snaplogo" className="mx-auto mt-5 max-w-[860px] text-left sm:mt-8">
              <p className="text-center text-[11px] font-semibold uppercase tracking-[1.5px] text-primary">Trusted sourcing network</p>
              <h2 id="why-snaplogo" className="mt-1 text-center text-xl font-semibold text-foreground sm:mt-1.5 sm:text-2xl">Why brands source through Snaplogo</h2>
              <ul className="mt-3 grid gap-2 sm:mt-5 sm:grid-cols-3 sm:gap-3">
                {([
                  ["Vetted manufacturers", "Screened for capability, factory equipment and D2C track record.", ShieldCheck],
                  ["Comparable quotes", "Standardized bids to evaluate unit price, MOQs and lead times easily.", ArrowLeftRight],
                  ["End-to-end coordination", "Direct WhatsApp & team support to clarify specs and follow up with suppliers.", Users],
                ] as const).map(([title, sub, Icon]) => <li key={title} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:block sm:p-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-primary sm:h-9 sm:w-9"><Icon className="h-4 w-4" aria-hidden="true" /></span><span className="min-w-0"><h3 className="text-sm font-semibold text-foreground sm:mt-3">{title}</h3><p className="mt-0.5 text-xs leading-relaxed text-muted-foreground sm:mt-1">{sub}</p></span></li>)}
              </ul>
              <details className="group/vet mt-3 rounded-xl border border-border bg-card shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden">
                  How does Snaplogo vet manufacturers?<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open/vet:rotate-90" />
                </summary>
                <div className="space-y-3 border-t border-border px-4 py-4 text-xs leading-relaxed text-muted-foreground">
                  <p>We don’t just list manufacturers — our sourcing team works with them on real briefs. Here’s what happens behind every quotation you receive.</p>
                  <p><strong className="font-semibold text-foreground">Screened before they join.</strong> Manufacturers are reviewed for their packaging capability, production setup and experience with D2C brands before entering our network. Makers who can’t support brand-scale orders don’t make the cut.</p>
                  <p><strong className="font-semibold text-foreground">Categories we cover.</strong> Corrugated boxes (shipping, mailer, die-cut, printed) and flexible packaging (stand-up pouches, sachets, roll stock). Every manufacturer is mapped to the categories they actually produce.</p>
                  <p><strong className="font-semibold text-foreground">Quotations collected &amp; compared.</strong> Your brief goes to relevant manufacturers, and our team collects their quotations, MOQs and lead times. You receive comparable options on WhatsApp — not a single take-it-or-leave-it price.</p>
                  <p><strong className="font-semibold text-foreground">A team that coordinates for you.</strong> Snaplogo’s sourcing team handles the back-and-forth with suppliers — clarifying specs, following up on quotes and keeping your requirement confidential. Zero commission, no exclusivity.</p>
                </div>
              </details>
            </section>
            <CorrugatedDesigns onUseDesign={(prefill, designs) => {
              setQuery(previous => previous.trim() ? `${previous}\n\n${prefill}` : prefill); setError("");
              input.current?.focus(); input.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              void designReferenceImage(designs).then(image => setPhotos(previous => [...previous, image].slice(0, 4))).catch(e => setError(e instanceof Error ? e.message : "Couldn’t attach the design reference."));
            }} />
            <section aria-labelledby="manufacturer-sourcing-questions" className="mx-auto mt-10 max-w-[860px] border-t border-border pt-6 text-left">
              <h2 id="manufacturer-sourcing-questions" className="text-xl font-semibold">Finding your packaging manufacturer</h2>
              <div className="mt-4 divide-y divide-border">
                {[
                  ["How do I find a corrugated box manufacturer?", "Share your box style, length × width × height, quantity and printing needs. If known, include the corrugated wall grade, such as 3-ply or 5-ply. Snaplogo’s sourcing team reviews your brief and sends matched manufacturer details and quotations on WhatsApp."],
                  ["How do I find stand-up pouch or sachet manufacturers?", "Describe the product you will pack, pouch or sachet format, size, quantity and printing. Include any known material, barrier or closure requirements and attach a design if you have one. Leave uncertain specifications open for confirmation rather than guessing."],
                  ["What is the minimum order quantity and price?", "MOQ and price need to be confirmed for your specific design and manufacturer. Share your target quantity and budget so the sourcing team can look for a suitable fit. Catalogue photos are references, not fixed-price offers."],
                  ["Can I request a manufacturer in Ahmedabad or another city?", "Yes—include your preferred city in your brief. The team will review location preferences alongside your packaging needs; availability in a particular city must be confirmed. Snaplogo connects brands with manufacturers and does not manufacture packaging itself."],
                ].map(([question, answer]) => <details key={question} className="group py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden">{question}<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" /></summary><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{answer}</p></details>)}
              </div>
            </section>
          </div>}
          {(current || busy) && <div ref={chatAnchor} className="mx-auto max-w-[860px] scroll-mt-20 py-8">
            <ol className="sourcing-composer mb-8 flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-5 md:px-7" aria-label="Progress">{["Requirements", "Brief", "Contact"].map((label, i) => { const step = project?.submitted ? 3 : askingPhone ? 2 : project?.brief?.length ? 1 : 0; const done = i < step; const active = i === step; return <li key={label} className="flex flex-1 items-center gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${done ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{done ? <Check className="h-4 w-4" /> : i + 1}</span><span className={`hidden min-w-0 text-sm font-semibold md:block ${done || active ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>{i < 2 && <span className={`h-px min-w-4 flex-1 ${done ? "bg-primary" : "bg-border"}`} />}</li>; })}</ol>
            <div className="space-y-6">{turns.map((turn, index) => <div key={index} className="space-y-6"><div className="flex justify-end gap-2 sm:gap-3"><div className="max-w-[80%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary px-4 py-3 sm:px-6 sm:py-4 text-[15px] md:text-base text-primary-foreground shadow-sm">{turn.query}{(turn.images?.length ?? 0) > 0 && <div className="mt-2 flex flex-wrap gap-2">{turn.images?.map((src, i) => <img key={i} src={src} alt={`Photo ${i + 1}`} className="h-24 w-24 rounded-lg object-cover" />)}</div>}</div><span className="mt-1 flex h-7 w-7 shrink-0 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-accent text-accent-foreground"><User className="h-4 w-4" /></span></div>{turn.assistantMessage && <div className="flex max-w-full gap-2 sm:max-w-[90%] sm:gap-3"><img src={logo} alt="" className="mt-1 h-7 w-7 shrink-0 rounded-full sm:h-10 sm:w-10 border border-border bg-card p-1.5" /><div className="sourcing-composer whitespace-pre-wrap rounded-2xl rounded-tl-md border border-border bg-card px-4 py-4 sm:px-6 sm:py-5 text-[15px] md:text-base leading-relaxed">{turn.assistantMessage}</div></div>}{(turn.questions?.length ?? 0) > 0 && <div className="flex max-w-full gap-2 sm:max-w-[90%] sm:gap-3"><img src={logo} alt="" className="mt-1 h-7 w-7 shrink-0 rounded-full sm:h-10 sm:w-10 border border-border bg-card p-1.5" /><div className="sourcing-composer rounded-2xl rounded-tl-md border border-border bg-card px-4 py-4 sm:px-6 sm:py-5 text-[15px] md:text-base leading-relaxed"><p className="mb-3 font-semibold text-foreground">A few quick details would help</p><ul className="space-y-3">{turn.questions?.map((q, qi) => <li key={q.topic} className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">{qi + 1}</span><span className="pt-1">{q.question}</span></li>)}</ul>{turn.questionsSkipped && <p className="mt-2 text-xs text-muted-foreground">Skipped</p>}</div></div>}{turn.followUp && <div className="flex max-w-full gap-2 sm:max-w-[90%] sm:gap-3"><img src={logo} alt="" className="mt-1 h-7 w-7 shrink-0 rounded-full sm:h-10 sm:w-10 border border-border bg-card p-1.5" /><div className="sourcing-composer rounded-2xl rounded-tl-md border border-border bg-card px-4 py-4 sm:px-6 sm:py-5 text-[15px] md:text-base leading-relaxed">{turn.followUp === "design" ? <><p className="font-semibold text-foreground">Do you have any design with you?</p><p className="mt-1 text-muted-foreground">Helps manufacturers quote accurately — totally optional.</p></> : <><p>We’ll now take your packaging requirements to our manufacturer network and identify suitable manufacturers for your needs.</p>{askingPhone && !designStep && index === turns.length - 1 && <SourcingBrief fields={project?.brief ?? []} onSave={fields => setProjects(prev => prev.map(p => p.id === activeId ? { ...p, brief: fields.filter(f => f.value.trim()) } : p))} />}<p className="mt-1">We’ll share the quotations within 24 hours. <strong className="font-semibold text-foreground">Kindly share your phone number to keep you updated.</strong></p></>}</div></div>}</div>)}{busy && <div className="ml-auto max-w-[80%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary px-4 py-3 sm:px-6 sm:py-4 text-[15px] md:text-base text-primary-foreground">{pendingQuery}</div>}</div>
            {busy ? <div className="py-6" role="status">{liveMessage && <div className="mb-4 flex max-w-full gap-2 sm:max-w-[90%] sm:gap-3"><img src={logo} alt="" className="mt-1 h-7 w-7 shrink-0 rounded-full border border-border bg-card p-1.5 sm:h-10 sm:w-10" /><div className="sourcing-composer whitespace-pre-wrap rounded-2xl rounded-tl-md border border-border bg-card px-4 py-4 text-[15px] leading-relaxed sm:px-6 sm:py-5 md:text-base">{liveMessage}</div></div>}{liveQuestions.length > 0 && <div className="mb-4 flex max-w-full gap-2 sm:max-w-[90%] sm:gap-3"><img src={logo} alt="" className="h-10 w-10 shrink-0 rounded-full border border-border bg-card p-1.5" /><div className="sourcing-composer rounded-2xl border border-border bg-card px-4 py-4 sm:px-6 sm:py-5 text-[15px] md:text-base leading-relaxed"><p className="mb-3 font-semibold">A few quick details would help</p><ol className="space-y-3">{liveQuestions.map((q, i) => <li key={q.topic} className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">{i + 1}</span><span className="pt-1">{q.question}</span></li>)}</ol></div></div>}<div className="flex items-center gap-3 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" />Reviewing your packaging details…</div></div> : project?.submitted ? <section role="status" className="sourcing-composer mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--sourcing-success))] text-white shadow-sm"><Check className="h-6 w-6" /></span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-semibold tracking-tight">Your sourcing brief is submitted</h2>
                  {project.phone && <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><span>We’ll message you on</span><span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-sm font-semibold text-foreground"><MessageSquare className="h-3.5 w-3.5 text-[hsl(var(--sourcing-success))]" />{project.phone.trim().startsWith("+") ? project.phone.trim() : `+91 ${project.phone.trim()}`}</span></p>}
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Shortlisting from <span className="font-semibold text-foreground">100+ vetted manufacturers</span> — quotation <span className="font-semibold text-foreground">within 24 hours</span>.</p>
                </div>
              </div>
              <ol aria-label="What happens next" className="mt-8 grid gap-4 rounded-xl border border-border/70 bg-background/60 p-4 sm:grid-cols-3 md:p-5">{[[true, "Brief received", "With our sourcing team"], [false, "Manufacturer matching", "From 100+ vetted makers"], [false, "Quote on WhatsApp", "Details & pricing in 24 hrs"]].map(([done, label, sub], i) => <li key={label as string} className="flex items-start gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${done ? "border-transparent bg-[hsl(var(--sourcing-success))] text-white" : "border-border bg-card text-muted-foreground"}`}>{done ? <Check className="h-4 w-4" /> : i + 1}</span><span className="min-w-0"><span className="block text-sm font-semibold">{label}</span><span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{sub}</span></span></li>)}</ol>
              <SourcingBrief fields={project.brief ?? []} submitted onSave={fields => setProjects(prev => prev.map(p => p.id === activeId ? { ...p, brief: fields.filter(f => f.value.trim()) } : p))} />
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button onClick={startNew} className="rounded-full sm:flex-none"><Plus />New sourcing request</Button>
              </div>
            </section> : <>
              <div className="mt-6">{composer(true)}</div>
              {submitting && <p role="status" className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />Sending your request…</p>}
              {hasQuestions && <div className="mt-2 flex justify-end"><Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => void search("Skip the optional quotation details for now; use my packaging requirement.")}>Skip for now<ArrowRight /></Button></div>}
            </>}
          </div>}
          {error && <div role="alert" className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-card p-4 text-sm text-destructive"><span className="flex-1">{error}</span><Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Dismiss error" onClick={() => setError("")}><X /></Button></div>}
        </main>
        <footer className="mx-auto flex max-w-[900px] flex-wrap items-center justify-between gap-2 border-t border-border/60 px-5 py-6 text-xs text-muted-foreground md:px-10"><span>© {new Date().getFullYear()} Snaplogo · India</span><nav className="flex flex-wrap items-center gap-1" aria-label="Site"><Button asChild variant="ghost" size="sm" className="text-muted-foreground"><Link to="/about">About</Link></Button><Button asChild variant="ghost" size="sm" className="text-muted-foreground"><Link to="/manufacturers">Manufacturers</Link></Button><Button asChild variant="ghost" size="sm" className="text-muted-foreground"><Link to="/designs">Designs</Link></Button><Button asChild variant="ghost" size="sm" className="text-muted-foreground"><Link to="/blog">Packaging guides</Link></Button><Button asChild variant="ghost" size="sm" className="text-muted-foreground"><Link to="/team">Team</Link></Button><Button asChild variant="ghost" size="sm" className="text-muted-foreground"><Link to="/privacy-policy">Privacy</Link></Button><Button asChild variant="ghost" size="sm" className="text-muted-foreground"><a href={TEAM_WHATSAPP} target="_blank" rel="noopener noreferrer"><MessageSquare />Talk to our team</a></Button></nav></footer>
      </div>
    </div>
  );
}
