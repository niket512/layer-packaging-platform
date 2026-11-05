import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftRight, ArrowRight, ArrowUp, ArrowUpRight, Check, ChevronRight, Loader2, ImagePlus, MessageSquare, Plus, ShieldCheck, User, Users, X, Zap, Handshake } from "lucide-react";
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
const PROMPT_TABS: { label: string; prompts: string[] }[] = [
  { label: "Pouches & sachets", prompts: ["I need [quantity] stand-up zipper pouches for [product], size [W×H cm], multicolour print", "Find sachet manufacturers for [product], [ml/g] per sachet, MOQ [quantity]", "I need kraft pouches with a window for [product], budget ₹[price] per piece"] },
];

function PromptTabs({ onPick }: { onPick: (phrase: string) => void }) {
  const [tab, setTab] = useState(0);
  return (
    <div className="mx-auto mt-4 max-w-[860px] text-left">
      <div role="tablist" aria-label="Example requests" className="flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none]">{PROMPT_TABS.map((t, i) => <button key={t.label} role="tab" type="button" aria-selected={tab === i} onClick={() => setTab(i)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === i ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground"}`}>{t.label}</button>)}</div>
      <ul role="tabpanel" className="mt-1 divide-y divide-border">{PROMPT_TABS[tab].prompts.map(p => <li key={p}><button type="button" onClick={() => onPick(p)} className="group flex w-full items-center gap-3 px-2 py-3 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"><span className="min-w-0 flex-1 truncate">{p}</span><ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/60 group-hover:text-primary" /></button></li>)}</ul>
    </div>
  );
}

export default function SourcingAgent({ category }: { category?: SourcingCategory } = {}) {
  const landing = category ? LANDINGS[category] : undefined;
  const navigate = useNavigate();
  const [projects, setProjects] = useState<SourcingProject[]>(() => {
    const saved = readSaved<unknown>(PROJECTS_KEY, []);
    return Array.isArray(saved) ? saved.filter(p => p && typeof p.id === "string" && typeof p.title === "string" && Array.isArray(p.turns)) : [];
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
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
  const intro = useRef<HTMLDivElement>(null);
  const transcript = useRef<HTMLDivElement>(null);
  const [introHeight, setIntroHeight] = useState<number>();
  useLayoutEffect(() => {
    if (current || busy || !intro.current) return;
    const element = intro.current;
    const observer = new ResizeObserver(() => setIntroHeight(element.getBoundingClientRect().height));
    setIntroHeight(element.getBoundingClientRect().height);
    observer.observe(element);
    return () => observer.disconnect();
  }, [current, busy]);
  useLayoutEffect(() => {
    if (transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight;
  }, [turns.length, busy, liveMessage, liveQuestions]);

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
    <form onSubmit={e => { e.preventDefault(); void search(); }} className={`sourcing-composer rounded-2xl border border-border bg-background p-2.5 sm:p-4 focus-within:ring-2 focus-within:ring-primary/20 ${compact ? "" : "mt-3 md:mt-5"}`}>
      <label htmlFor="sourcing-query" className="sr-only">{compact ? "Your answer" : "Packaging requirement"}</label>
      <textarea ref={input} id="sourcing-query" value={query} onChange={e => setQuery(e.target.value)} maxLength={500} disabled={busy || submitting} rows={compact ? 3 : 3} placeholder={designStep ? "Share a design or photo, or say you don’t have one…" : askingPhone ? "Your WhatsApp number, e.g. 98765 43210" : compact ? "Your answer, or any other details…" : "Ask Snaplogo Sourcing Expert… e.g. 5,000 printed kraft corrugated boxes, delivered to Bengaluru"} className="w-full resize-none bg-transparent px-1 pt-1 text-base leading-relaxed sm:px-2 sm:pt-2 text-foreground outline-none placeholder:text-muted-foreground" onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void search(); } }} />
      {photos.length > 0 && <div className="flex flex-wrap gap-2 px-2 pt-2">{photos.map((src, i) => <div key={i} className="relative"><img src={src} alt={`Attached photo ${i + 1}`} className="h-16 w-16 rounded-lg border border-border object-cover" /><button type="button" aria-label="Remove photo" onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background"><X className="h-3 w-3" /></button></div>)}</div>}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2.5"><div className="flex items-center gap-1"><input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={e => void addPhotos(e.target.files)} /><Button type="button" variant="ghost" size="sm" disabled={busy || submitting || photos.length >= 4} onClick={() => fileInput.current?.click()} className="h-10 px-2 text-xs text-muted-foreground sm:text-sm"><ImagePlus /><span className="sm:hidden">Add photo</span><span className="hidden sm:inline">Add design / photos</span></Button>{!compact && <Button type="button" variant="ghost" size="sm" disabled={busy || submitting} onClick={() => { setQuery(TEMPLATE); input.current?.focus(); }} className="h-10 px-2 text-xs text-muted-foreground sm:text-sm"><Zap /><span className="sm:hidden">Template</span><span className="hidden sm:inline">Use template</span></Button>}</div>{compact ? <Button type="submit" size="icon" disabled={busy || submitting || (!query.trim() && !photos.length)} aria-label="Send answer" className="h-10 w-10 rounded-full shadow-sm disabled:opacity-100 disabled:bg-primary/70">{busy ? <Loader2 className="animate-spin" /> : <ArrowUp />}</Button> : <Button type="submit" disabled={busy || submitting || (!query.trim() && !photos.length)} className="h-10 shrink-0 rounded-full px-3 text-[11px] font-bold uppercase tracking-wide shadow-sm disabled:opacity-100 disabled:bg-primary/70 max-sm:order-first max-sm:w-full sm:px-5 sm:text-[13px]">{busy ? <Loader2 className="animate-spin" /> : <>{landing?.cta ?? "Get Packaging Quotes"}<ArrowRight /></>}</Button>}</div>
    </form>
  );
  const designGallery = (
    <CorrugatedDesigns onUseDesign={(prefill, designs) => {
      setQuery(previous => previous.trim() ? `${previous}\n\n${prefill}` : prefill); setError("");
      input.current?.focus(); input.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      void designReferenceImage(designs).then(image => setPhotos(previous => [...previous, image].slice(0, 4))).catch(e => setError(e instanceof Error ? e.message : "Couldn’t attach the design reference."));
    }} />
  );
  return (
    <div className="theme-sourcing min-h-screen bg-background text-foreground">
      <div>
        <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-3 px-4 md:h-16 md:px-8">
            <Link to="/" className="flex shrink-0 items-center gap-2 text-lg font-bold md:text-xl"><img src={logo} alt="" className="h-7 w-7 md:h-8 md:w-8" />snaplogo<span className="-ml-2 text-primary">.</span></Link>
            <nav aria-label="Main" className="hidden items-center gap-1 text-sm font-medium md:flex">
              <Link to="/manufacturers" className="rounded-full px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Manufacturers</Link>
              <Link to="/designs" className="rounded-full px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Designs</Link>
              <Link to="/blog" className="rounded-full px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Guides</Link>
              <Link to="/about" className="rounded-full px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">About</Link>
            </nav>
            <div className="flex items-center gap-2"><Link to="/manufacturers" className="hidden rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary sm:inline-flex md:hidden lg:inline-flex">For manufacturers</Link><Button onClick={startNew} disabled={busy || submitting} size="sm" aria-label="New sourcing request" className="h-9 rounded-full px-4 text-sm"><Plus /><span>New Request</span></Button></div>
          </div>
          <nav aria-label="Packaging categories" className="border-t border-border/70">
            <div className="mx-auto flex max-w-[1200px] items-center gap-1 overflow-x-auto px-3 py-1.5 text-[13px] [scrollbar-width:none] md:px-7">
              {([["All packaging", "/"], ["Corrugated boxes", "/sourcing/corrugated-boxes"], ["Mailer boxes", "/sourcing/mailer-boxes"], ["Flexible pouches", "/sourcing/flexible-pouches"], ["Sachets", "/sourcing/sachets"], ["Cosmetic packaging", "/sourcing/cosmetic-packaging"]] as const).map(([label, to]) => { const active = (to === "/" && !category) || to.endsWith(`/${category}`); return <Link key={to} to={to} aria-current={active ? "page" : undefined} className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 font-medium transition-colors ${active ? "bg-accent text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{label}</Link>; })}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-[1280px] px-4 pb-12 md:px-8">
          <div className="mx-auto pb-4 text-center">
            <section aria-label="Sourcing chat" className="mx-auto flex min-h-[calc(100svh-6.5rem)] max-w-[820px] flex-col justify-center py-6 text-left">
            <div className="text-center">
            <div className="relative mx-auto max-w-[820px]" style={current || busy ? { height: introHeight } : undefined}>
            {current || busy ? (
            <div ref={transcript} role="region" aria-label="Conversation" className="absolute inset-0 overflow-y-auto overscroll-contain text-left [overflow-anchor:none]">
            <ol className="sourcing-composer mb-4 flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2" aria-label="Progress">{["Requirements", "Brief", "Contact"].map((label, i) => { const step = project?.submitted ? 3 : askingPhone ? 2 : project?.brief?.length ? 1 : 0; const done = i < step; const active = i === step; return <li key={label} className="flex flex-1 items-center gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${done ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{done ? <Check className="h-4 w-4" /> : i + 1}</span><span className={`hidden min-w-0 text-sm font-semibold md:block ${done || active ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>{i < 2 && <span className={`h-px min-w-4 flex-1 ${done ? "bg-primary" : "bg-border"}`} />}</li>; })}</ol>
            <div className="space-y-6">{turns.map((turn, index) => <div key={index} className="space-y-6"><div className="flex justify-end gap-2 sm:gap-3"><div className="max-w-[80%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary px-4 py-3 sm:px-6 sm:py-4 text-[15px] md:text-base text-primary-foreground shadow-sm">{turn.query}{(turn.images?.length ?? 0) > 0 && <div className="mt-2 flex flex-wrap gap-2">{turn.images?.map((src, i) => <img key={i} src={src} alt={`Photo ${i + 1}`} className="h-24 w-24 rounded-lg object-cover" />)}</div>}</div><span className="mt-1 flex h-7 w-7 shrink-0 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-accent text-accent-foreground"><User className="h-4 w-4" /></span></div>{turn.assistantMessage && <div className="flex max-w-full gap-2 sm:max-w-[90%] sm:gap-3"><img src={logo} alt="" className="mt-1 h-7 w-7 shrink-0 rounded-full sm:h-10 sm:w-10 border border-border bg-card p-1.5" /><div className="sourcing-composer whitespace-pre-wrap rounded-2xl rounded-tl-md border border-border bg-card px-4 py-4 sm:px-6 sm:py-5 text-[15px] md:text-base leading-relaxed">{turn.assistantMessage}</div></div>}{(turn.questions?.length ?? 0) > 0 && <div className="flex max-w-full gap-2 sm:max-w-[90%] sm:gap-3"><img src={logo} alt="" className="mt-1 h-7 w-7 shrink-0 rounded-full sm:h-10 sm:w-10 border border-border bg-card p-1.5" /><div className="sourcing-composer rounded-2xl rounded-tl-md border border-border bg-card px-4 py-4 sm:px-6 sm:py-5 text-[15px] md:text-base leading-relaxed"><p className="mb-3 font-semibold text-foreground">A few quick details would help</p><ul className="space-y-3">{turn.questions?.map((q, qi) => <li key={q.topic} className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">{qi + 1}</span><span className="pt-1">{q.question}</span></li>)}</ul>{turn.questionsSkipped && <p className="mt-2 text-xs text-muted-foreground">Skipped</p>}</div></div>}{turn.followUp && <div className="flex max-w-full gap-2 sm:max-w-[90%] sm:gap-3"><img src={logo} alt="" className="mt-1 h-7 w-7 shrink-0 rounded-full sm:h-10 sm:w-10 border border-border bg-card p-1.5" /><div className="sourcing-composer rounded-2xl rounded-tl-md border border-border bg-card px-4 py-4 sm:px-6 sm:py-5 text-[15px] md:text-base leading-relaxed">{turn.followUp === "design" ? <><p className="font-semibold text-foreground">Do you have any design with you?</p><p className="mt-1 text-muted-foreground">Helps manufacturers quote accurately — totally optional.</p></> : <><p>We’ll now take your packaging requirements to our manufacturer network and identify suitable manufacturers for your needs.</p>{askingPhone && !designStep && index === turns.length - 1 && <SourcingBrief fields={project?.brief ?? []} onSave={fields => setProjects(prev => prev.map(p => p.id === activeId ? { ...p, brief: fields.filter(f => f.value.trim()) } : p))} />}<p className="mt-1">We’ll share the quotations within 24 hours. <strong className="font-semibold text-foreground">Kindly share your phone number to keep you updated.</strong></p></>}</div></div>}</div>)}{busy && <div className="ml-auto max-w-[80%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary px-4 py-3 sm:px-6 sm:py-4 text-[15px] md:text-base text-primary-foreground">{pendingQuery}</div>}</div>
            {busy && <div className="py-6" role="status">{liveMessage && <div className="mb-4 flex max-w-full gap-2 sm:max-w-[90%] sm:gap-3"><img src={logo} alt="" className="mt-1 h-7 w-7 shrink-0 rounded-full border border-border bg-card p-1.5 sm:h-10 sm:w-10" /><div className="sourcing-composer whitespace-pre-wrap rounded-2xl rounded-tl-md border border-border bg-card px-4 py-4 text-[15px] leading-relaxed sm:px-6 sm:py-5 md:text-base">{liveMessage}</div></div>}{liveQuestions.length > 0 && <div className="mb-4 flex max-w-full gap-2 sm:max-w-[90%] sm:gap-3"><img src={logo} alt="" className="h-10 w-10 shrink-0 rounded-full border border-border bg-card p-1.5" /><div className="sourcing-composer rounded-2xl border border-border bg-card px-4 py-4 sm:px-6 sm:py-5 text-[15px] md:text-base leading-relaxed"><p className="mb-3 font-semibold">A few quick details would help</p><ol className="space-y-3">{liveQuestions.map((q, i) => <li key={q.topic} className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">{i + 1}</span><span className="pt-1">{q.question}</span></li>)}</ol></div></div>}<div className="flex items-center gap-3 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" />Reviewing your packaging details…</div></div>}{project?.submitted ? <section role="status" className="sourcing-composer mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
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
              {submitting && <p role="status" className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />Sending your request…</p>}
              {hasQuestions && <div className="mt-2 flex justify-end"><Button variant="ghost" size="sm" disabled={busy || submitting} className="text-muted-foreground" onClick={() => void search("Skip the optional quotation details for now; use my packaging requirement.")}>Skip for now<ArrowRight /></Button></div>}
            </>}
            </div>
            ) : <div ref={intro}>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-end sm:justify-center sm:gap-5">
              <div className="text-center">
                <h1 className="text-[11px] font-semibold uppercase tracking-[1.5px] text-primary">{landing?.headline ?? "Get Custom Packaging Quotes from Vetted Manufacturers"}</h1>
                <p className="mt-1 mb-6 text-[28px] font-semibold leading-9 text-foreground sm:text-[36px] sm:leading-tight">What packaging are we sourcing today?</p>
                <p className="mt-1 text-sm text-muted-foreground">Quotes from <strong className="font-semibold text-foreground">100+ vetted manufacturers</strong> within <strong className="font-semibold text-foreground">24 hours</strong> · 0% commission</p>
              </div>
            </div>
            </div>}
            </div>
            <div className="mx-auto w-full max-w-[820px] text-left">{composer()}</div>
            </div></section>
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
            </section>
            {designGallery}
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
          </div>
          {error && <div role="alert" className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-card p-4 text-sm text-destructive"><span className="flex-1">{error}</span><Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Dismiss error" onClick={() => setError("")}><X /></Button></div>}
        </main>
        <footer className="mx-auto flex max-w-[900px] flex-wrap items-center justify-between gap-2 border-t border-border/60 px-5 py-6 text-xs text-muted-foreground md:px-10"><span>© {new Date().getFullYear()} Snaplogo · India</span><nav className="flex flex-wrap items-center gap-1" aria-label="Site"><Button asChild variant="ghost" size="sm" className="text-muted-foreground"><Link to="/about">About</Link></Button><Button asChild variant="ghost" size="sm" className="text-muted-foreground"><Link to="/manufacturers">Manufacturers</Link></Button><Button asChild variant="ghost" size="sm" className="text-muted-foreground"><Link to="/designs">Designs</Link></Button><Button asChild variant="ghost" size="sm" className="text-muted-foreground"><Link to="/blog">Packaging guides</Link></Button><Button asChild variant="ghost" size="sm" className="text-muted-foreground"><Link to="/team">Team</Link></Button><Button asChild variant="ghost" size="sm" className="text-muted-foreground"><Link to="/privacy-policy">Privacy</Link></Button><Button asChild variant="ghost" size="sm" className="text-muted-foreground"><a href={TEAM_WHATSAPP} target="_blank" rel="noopener noreferrer"><MessageSquare />Talk to our team</a></Button></nav></footer>
      </div>
    </div>
  );
}
