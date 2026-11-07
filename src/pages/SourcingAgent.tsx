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
    const el = transcript.current;
    if (!el) return;
    let frame = 0;
    const scrollToLatest = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        // Scroll only the conversation, after mobile layout/keyboard changes settle.
        // Repeated smooth animations can be interrupted by streamed replies.
        el.scrollTop = el.scrollHeight;
      });
    };
    const resizeObserver = new ResizeObserver(scrollToLatest);
    const observeContent = () => {
      resizeObserver.disconnect();
      resizeObserver.observe(el);
      Array.from(el.children).forEach(child => resizeObserver.observe(child));
      scrollToLatest();
    };
    const mutationObserver = new MutationObserver(observeContent);
    mutationObserver.observe(el, { childList: true, subtree: true, characterData: true });
    observeContent();
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", scrollToLatest);
    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      viewport?.removeEventListener("resize", scrollToLatest);
    };
  }, [!!(current || busy)]);

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
    <form onSubmit={e => { e.preventDefault(); void search(); }} className={`sourcing-composer rounded-2xl border border-border bg-card shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.25)] p-2.5 sm:p-4 focus-within:ring-2 focus-within:ring-primary/20 ${compact ? "" : "mt-3 md:mt-5"}`}>
      <label htmlFor="sourcing-query" className="sr-only">{compact ? "Your answer" : "Packaging requirement"}</label>
      <textarea ref={input} id="sourcing-query" value={query} onChange={e => setQuery(e.target.value)} maxLength={500} disabled={busy || submitting} rows={compact ? 2 : 3} placeholder={designStep ? "Share a design or photo, or say you don’t have one…" : askingPhone ? "Your WhatsApp number, e.g. 98765 43210" : compact ? "Your answer, or any other details…" : "e.g. 5,000 printed kraft boxes, delivered to Bengaluru"} className="w-full resize-none bg-transparent px-1 pt-1 text-base leading-relaxed sm:px-2 sm:pt-2 text-foreground outline-none placeholder:text-muted-foreground" onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void search(); } }} />
      {photos.length > 0 && <div className="flex flex-wrap gap-2 px-2 pt-2">{photos.map((src, i) => <div key={i} className="relative"><img src={src} alt={`Attached photo ${i + 1}`} className="h-16 w-16 rounded-lg border border-border object-cover" /><button type="button" aria-label="Remove photo" onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background"><X className="h-3 w-3" /></button></div>)}</div>}
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 sm:mt-2 sm:border-t sm:border-border sm:pt-2.5"><div className="flex items-center gap-1"><input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={e => void addPhotos(e.target.files)} /><Button type="button" variant="ghost" size="sm" disabled={busy || submitting || photos.length >= 4} onClick={() => fileInput.current?.click()} className="h-9 px-2 text-xs text-muted-foreground sm:h-10 sm:text-sm"><ImagePlus /><span className="sm:hidden">Upload design</span><span className="hidden sm:inline">Add design / photos</span></Button>{!compact && <Button type="button" variant="ghost" size="sm" disabled={busy || submitting} onClick={() => { setQuery(TEMPLATE); input.current?.focus(); }} className="h-10 px-2 text-xs text-muted-foreground sm:text-sm"><Zap /><span className="max-sm:text-xs sm:hidden">Help me write</span><span className="hidden sm:inline">Help me write it</span></Button>}</div>{compact ? <Button type="submit" size="icon" disabled={busy || submitting || (!query.trim() && !photos.length)} aria-label="Send answer" className="h-10 w-10 rounded-full shadow-sm disabled:opacity-100 disabled:bg-primary/70">{busy ? <Loader2 className="animate-spin" /> : <ArrowUp />}</Button> : <Button type="submit" disabled={busy || submitting || (!query.trim() && !photos.length)} className="h-10 shrink-0 rounded-full px-3 max-sm:w-full text-[11px] font-bold uppercase tracking-wide shadow-sm disabled:opacity-100 disabled:bg-primary/70 sm:px-5 sm:text-[13px]">{busy ? <Loader2 className="animate-spin" /> : <>{landing?.cta ?? "Get Free Quotes"}<ArrowRight /></>}</Button>}</div>
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
              <Link to="/designs" className="rounded-full px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Designs</Link>
              <Link to="/blog" className="rounded-full px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Guides</Link>
              <Link to="/about" className="rounded-full px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">About</Link>
            </nav>
            <div className="flex items-center gap-2"><Link to="/manufacturers" className="hidden rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary sm:inline-flex md:hidden lg:inline-flex">For manufacturers</Link><Button onClick={startNew} disabled={busy || submitting} size="sm" aria-label="New sourcing request" className="h-9 rounded-full px-4 text-sm"><Plus /><span>New Request</span></Button></div>
          </div>
        </header>
        <main className="mx-auto max-w-[1280px] px-4 pb-12 md:px-8">
          <div className="mx-auto pb-4 text-center">
            <section aria-label="Sourcing chat" className={`mx-auto flex max-w-[820px] flex-col text-left ${current || busy ? "pt-3 pb-3 sm:pt-6" : "pt-6 pb-4 sm:pt-16 sm:pb-6"}`}>
            <div className="text-center">
            <div className={`relative mx-auto w-full max-w-[820px] ${current || busy ? "h-[calc(100dvh-230px)] min-h-[340px] sm:h-[calc(100dvh-280px)]" : ""}`}>
            {current || busy ? (
            <div ref={transcript} role="region" aria-label="Conversation" className="absolute inset-0 overflow-y-auto overscroll-contain px-0.5 pb-4 text-left [overflow-anchor:none]">
            <ol className="sourcing-composer mb-4 flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2" aria-label="Progress">{["Requirements", "Brief", "Contact"].map((label, i) => { const step = project?.submitted ? 3 : askingPhone ? 2 : project?.brief?.length ? 1 : 0; const done = i < step; const active = i === step; return <li key={label} className="flex flex-1 items-center gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${done ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{done ? <Check className="h-4 w-4" /> : i + 1}</span><span className={`hidden min-w-0 text-sm font-semibold md:block ${done || active ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>{i < 2 && <span className={`h-px min-w-4 flex-1 ${done ? "bg-primary" : "bg-border"}`} />}</li>; })}</ol>
            <div className="space-y-6">{turns.map((turn, index) => <div key={index} className="space-y-6"><div className="flex justify-end gap-2 sm:gap-3"><div className="max-w-[80%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary px-4 py-3 sm:px-6 sm:py-4 text-[15px] md:text-base text-primary-foreground shadow-sm">{turn.query}{(turn.images?.length ?? 0) > 0 && <div className="mt-2 flex flex-wrap gap-2">{turn.images?.map((src, i) => <img key={i} src={src} alt={`Photo ${i + 1}`} className="h-24 w-24 rounded-lg object-cover" />)}</div>}</div><span className="mt-1 flex h-7 w-7 shrink-0 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-accent text-accent-foreground"><User className="h-4 w-4" /></span></div>{turn.assistantMessage && <div className="flex max-w-full gap-2 sm:max-w-[90%] sm:gap-3"><img src={logo} alt="" className="mt-1 h-7 w-7 shrink-0 rounded-full sm:h-10 sm:w-10 border border-border bg-card p-1.5" /><div className="sourcing-composer whitespace-pre-wrap rounded-2xl rounded-tl-md border border-border bg-card px-4 py-4 sm:px-6 sm:py-5 text-[15px] md:text-base leading-relaxed">{turn.assistantMessage}</div></div>}{(turn.questions?.length ?? 0) > 0 && <div className="flex max-w-full gap-2 sm:max-w-[90%] sm:gap-3"><img src={logo} alt="" className="mt-1 h-7 w-7 shrink-0 rounded-full sm:h-10 sm:w-10 border border-border bg-card p-1.5" /><div className="sourcing-composer rounded-2xl rounded-tl-md border border-border bg-card px-4 py-4 sm:px-6 sm:py-5 text-[15px] md:text-base leading-relaxed"><p className="mb-3 font-semibold text-foreground">A few quick details would help</p><ul className="space-y-3">{turn.questions?.map((q, qi) => <li key={q.topic} className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">{qi + 1}</span><span className="pt-1">{q.question}</span></li>)}</ul>{turn.questionsSkipped && <p className="mt-2 text-xs text-muted-foreground">Skipped</p>}</div></div>}{turn.followUp && <div className="flex max-w-full gap-2 sm:max-w-[90%] sm:gap-3"><img src={logo} alt="" className="mt-1 h-7 w-7 shrink-0 rounded-full sm:h-10 sm:w-10 border border-border bg-card p-1.5" /><div className="sourcing-composer rounded-2xl rounded-tl-md border border-border bg-card px-4 py-4 sm:px-6 sm:py-5 text-[15px] md:text-base leading-relaxed">{turn.followUp === "design" ? <><p className="font-semibold text-foreground">Do you have any design with you?</p><p className="mt-1 text-muted-foreground">Helps manufacturers quote accurately — totally optional.</p></> : <>{askingPhone && !designStep && index === turns.length - 1 && <SourcingBrief fields={project?.brief ?? []} onSave={fields => setProjects(prev => prev.map(p => p.id === activeId ? { ...p, brief: fields.filter(f => f.value.trim()) } : p))} />}<p className="mt-1">We’ll now take your packaging requirements to our manufacturer network and share quotations from multiple manufacturers within 4 hours. <strong className="font-semibold text-foreground">Kindly share your phone number to keep you updated.</strong></p></>}</div></div>}</div>)}{busy && <div className="ml-auto max-w-[80%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary px-4 py-3 sm:px-6 sm:py-4 text-[15px] md:text-base text-primary-foreground">{pendingQuery}</div>}</div>
            {busy && <div className="py-6" role="status">{liveMessage && <div className="mb-4 flex max-w-full gap-2 sm:max-w-[90%] sm:gap-3"><img src={logo} alt="" className="mt-1 h-7 w-7 shrink-0 rounded-full border border-border bg-card p-1.5 sm:h-10 sm:w-10" /><div className="sourcing-composer whitespace-pre-wrap rounded-2xl rounded-tl-md border border-border bg-card px-4 py-4 text-[15px] leading-relaxed sm:px-6 sm:py-5 md:text-base">{liveMessage}</div></div>}{liveQuestions.length > 0 && <div className="mb-4 flex max-w-full gap-2 sm:max-w-[90%] sm:gap-3"><img src={logo} alt="" className="h-10 w-10 shrink-0 rounded-full border border-border bg-card p-1.5" /><div className="sourcing-composer rounded-2xl border border-border bg-card px-4 py-4 sm:px-6 sm:py-5 text-[15px] md:text-base leading-relaxed"><p className="mb-3 font-semibold">A few quick details would help</p><ol className="space-y-3">{liveQuestions.map((q, i) => <li key={q.topic} className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">{i + 1}</span><span className="pt-1">{q.question}</span></li>)}</ol></div></div>}<div className="flex items-center gap-3 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" />Reviewing your packaging details…</div></div>}{project?.submitted ? <section role="status" className="sourcing-composer mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--sourcing-success))] text-white shadow-sm"><Check className="h-6 w-6" /></span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-semibold tracking-tight">Your sourcing brief is submitted</h2>
                  {project.phone && <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><span>We’ll message you on</span><span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-sm font-semibold text-foreground"><MessageSquare className="h-3.5 w-3.5 text-[hsl(var(--sourcing-success))]" />{project.phone.trim().startsWith("+") ? project.phone.trim() : `+91 ${project.phone.trim()}`}</span></p>}
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Shortlisting from <span className="font-semibold text-foreground">100+ vetted manufacturers</span> — quotations <span className="font-semibold text-foreground">within 4 hours</span>.</p>
                </div>
              </div>
              <ol aria-label="What happens next" className="mt-8 grid gap-4 rounded-xl border border-border/70 bg-background/60 p-4 sm:grid-cols-3 md:p-5">{[[true, "Brief received", "With our sourcing team"], [false, "Manufacturer matching", "From 100+ vetted makers"], [false, "Quote on WhatsApp", "Details & pricing in 4 hrs"]].map(([done, label, sub], i) => <li key={label as string} className="flex items-start gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${done ? "border-transparent bg-[hsl(var(--sourcing-success))] text-white" : "border-border bg-card text-muted-foreground"}`}>{done ? <Check className="h-4 w-4" /> : i + 1}</span><span className="min-w-0"><span className="block text-sm font-semibold">{label}</span><span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{sub}</span></span></li>)}</ol>
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
            <div className="relative text-center">
              <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 -z-10 h-56 w-[min(640px,100%)] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-3 py-1 text-[11px] font-semibold text-primary sm:text-xs"><span className="h-1.5 w-1.5 rounded-full bg-primary" />100+ vetted manufacturers across India</span>
              <h1 className="sr-only">{landing?.headline ?? "Get Custom Packaging Quotes from Vetted Manufacturers"}</h1>
              <p className="mx-auto mt-4 max-w-[680px] text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-foreground sm:text-[48px]">Custom packaging quotes in <span className="text-primary">4 hours</span>.</p>
              <p className="mx-auto mt-3 mb-5 max-w-[560px] text-[15px] leading-relaxed text-muted-foreground sm:mb-7 sm:text-base">Tell us your box or pouch need. Get comparable quotes on WhatsApp — free, 0% commission.</p>
            </div>
            </div>}
            </div>
            <div className={`mx-auto w-full max-w-[820px] text-left ${current || busy ? "sticky bottom-2 z-[5] mt-3" : ""}`}>{composer(!!(current || busy))}</div>
            {!current && !busy && <div className="mx-auto mt-3 w-full max-w-[820px] text-center">
              <div className="mx-auto max-w-[720px] rounded-2xl border border-border bg-card px-4 py-3 shadow-sm sm:px-6 sm:py-4">
                <dl className="grid grid-cols-3 divide-x divide-border text-center">{[["1,200+", "Requests handled"], ["₹2 Cr+", "Packaging sourced"], ["18%", "Avg. savings"]].map(([n, l]) => <div key={l} className="flex flex-col-reverse px-1"><dt className="text-[11px] text-muted-foreground sm:text-xs">{l}</dt><dd className="text-lg font-bold text-foreground sm:text-2xl">{n}</dd></div>)}</dl>
                <div className="mt-3 flex items-center gap-3 border-t border-border pt-3"><span className="shrink-0 text-[10px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">Trusted by</span><ul className="flex min-w-0 flex-1 gap-x-5 overflow-x-auto whitespace-nowrap text-sm font-bold text-muted-foreground/80 [scrollbar-width:none] sm:justify-between">{["Dastaan", "Bloomly", "Kaapi Co.", "Nutriva", "Herbalé", "Snackwise"].map(b => <li key={b}>{b}</li>)}</ul></div>
              </div>
              <ol className="mx-auto mt-8 grid max-w-[720px] grid-cols-3 text-center" aria-label="How it works">{[["Share your need", "Text or upload a design"], ["We match makers", "Screened box & pouch factories"], ["Compare quotes", "Price, MOQ & lead time on WhatsApp"]].map(([t, sub], i) => <li key={t} className="relative px-1">{i < 2 && <span aria-hidden="true" className="absolute left-1/2 top-4 h-px w-full bg-border" />}<span className="relative mx-auto flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-card text-sm font-bold text-primary">{i + 1}</span><p className="mt-2 text-xs font-semibold text-foreground sm:text-sm">{t}</p><p className="mt-0.5 hidden text-xs leading-snug text-muted-foreground sm:block">{sub}</p></li>)}</ol>
              <div className="-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 text-left [scrollbar-width:none] sm:mx-auto sm:grid sm:max-w-[820px] sm:grid-cols-3 sm:overflow-visible sm:px-0">{[["Got 3 comparable quotes in a day and saved 18% on our mailer boxes.", "Riya S.", "Bloomly · Mumbai"], ["Found a pouch maker with a 1,000 MOQ when others asked 10,000.", "Arjun M.", "Kaapi Co. · Bengaluru"], ["Sharing our design felt safe, and the sample came before bulk.", "Neha K.", "Nutriva · Delhi"]].map(([q, n, r]) => <figure key={n} className="w-[82%] shrink-0 snap-start rounded-2xl border border-border bg-card p-4 shadow-sm sm:w-auto"><div className="text-xs tracking-widest text-primary" aria-label="5 stars">★★★★★</div><blockquote className="mt-1.5 text-sm leading-relaxed text-foreground">“{q}”</blockquote><figcaption className="mt-2 text-xs text-muted-foreground"><span className="font-semibold text-foreground">{n}</span> · {r}</figcaption></figure>)}</div>
              <a href="https://chat.whatsapp.com/I0vypMLz6bEKIeViw8rwh6" target="_blank" rel="noopener noreferrer" onClick={() => window.__lovableEvents?.track?.("project.whatsapp_group_opened", { placement: "card" })} className="group mx-auto mt-4 flex max-w-[820px] items-center gap-3 rounded-2xl border border-[hsl(var(--sourcing-success)/0.25)] bg-[hsl(var(--sourcing-success)/0.06)] px-3.5 py-3 text-left transition-colors hover:bg-[hsl(var(--sourcing-success)/0.1)] sm:px-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--sourcing-success))] text-white"><MessageSquare className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground sm:text-[15px]">Brands and Manufacturers Group</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--sourcing-success))]" />100+ Brands · 20+ Manufacturers</span>
                </span>
                <span className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-[hsl(var(--sourcing-success))] px-4 text-xs font-bold uppercase tracking-wide text-white"><span className="sm:hidden">Join</span><span className="hidden sm:inline">Join WhatsApp community</span><ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
              </a>
              <figure className="mx-auto mt-8 hidden sm:block max-w-[560px] overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm">
                <figcaption className="flex items-center justify-between border-b border-border px-4 py-2.5 text-xs"><span className="font-semibold text-foreground">What you receive</span><span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Example</span></figcaption>
                <table className="w-full text-xs sm:text-sm"><thead className="text-muted-foreground"><tr><th className="px-4 py-2 text-left font-medium">Manufacturer</th><th className="px-2 py-2 text-right font-medium whitespace-nowrap">Per unit</th><th className="px-2 py-2 text-right font-medium">MOQ</th><th className="px-4 py-2 text-right font-medium whitespace-nowrap"><span className="sm:hidden">Lead</span><span className="hidden sm:inline">Lead time</span></th></tr></thead><tbody>{[["Maker A", "₹—", "1,000", "10 days", true], ["Maker B", "₹—", "2,000", "14 days", false], ["Maker C", "₹—", "500", "12 days", false]].map(([m, pr, moq, lt, best]) => <tr key={m as string} className="border-t border-border"><td className="px-4 py-2.5 font-medium text-foreground">{m}{best && <span className="ml-2 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-primary">Best fit</span>}</td><td className="px-2 py-2.5 text-right text-muted-foreground">{pr}</td><td className="px-2 py-2.5 text-right">{moq}</td><td className="px-4 py-2.5 text-right">{lt}</td></tr>)}</tbody></table>
                <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">Illustration only — real prices depend on your size, material, print and quantity.</p>
              </figure>
            </div>}
            </div></section>
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
      <CommunityPopup hidden={!!activeId || busy} />
    </div>
  );
}

function CommunityPopup({ hidden }: { hidden: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("snaplogo-community-popup")) return;
    const show = () => { if (!sessionStorage.getItem("snaplogo-community-popup")) { sessionStorage.setItem("snaplogo-community-popup", "1"); setOpen(true); } };
    const timer = window.setTimeout(show, 25000);
    const onScroll = () => { const h = document.documentElement; if ((h.scrollTop + h.clientHeight) / h.scrollHeight > 0.6) show(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.clearTimeout(timer); window.removeEventListener("scroll", onScroll); };
  }, []);
  if (!open || hidden) return null;
  return (
    <div role="dialog" aria-label="Join the Snaplogo WhatsApp community" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-[320px] animate-in fade-in slide-in-from-bottom-4 rounded-2xl border border-border bg-card p-3 shadow-xl md:inset-x-auto md:right-6 md:bottom-6">
      <button type="button" aria-label="Close" onClick={() => { window.__lovableEvents?.track?.("project.whatsapp_group_opened", { placement: "popup" }); setOpen(false); }} className="absolute right-2.5 top-2.5 rounded-full p-1 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
      <div className="flex items-center gap-3 pr-6">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--sourcing-success))] text-white"><MessageSquare className="h-4 w-4" /></span>
        <div>
          <p className="text-sm font-semibold text-foreground">Join 500+ D2C founders</p>
          <p className="text-xs text-muted-foreground">Real MOQ & price benchmarks, shared on WhatsApp</p>
        </div>
      </div>
      <a href="https://chat.whatsapp.com/I0vypMLz6bEKIeViw8rwh6" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="mt-2.5 flex h-9 w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--sourcing-success))] text-[13px] font-bold uppercase tracking-wide text-white hover:opacity-90">Join free on WhatsApp <ArrowRight className="h-4 w-4" /></a>
      <p className="mt-1.5 text-center text-[11px] text-muted-foreground">Free · No spam · Leave anytime</p>
    </div>
  );
}
