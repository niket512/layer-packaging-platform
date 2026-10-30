import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUp, Check, ChevronRight, Loader2, ImagePlus, MessageSquare, Plus, ShieldCheck, Sparkles, User, X, Zap, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CorrugatedDesigns } from "@/components/sourcing/CorrugatedDesigns";
import { designReferenceImage } from "@/components/sourcing/design-reference-image";
import { SourcingBrief } from "@/components/sourcing/SourcingBrief";
import { supabase } from "@/integrations/supabase/client";
import { looksLikeSourcingPhone, mergeSourcingBrief, sourcingProjectTitle, needsSourcingDesign, recordSourcingFollowUp, readSourcingStream, readSaved, sourcingRequest, sourcingSubmission, validSourcingPhone, validatedQuestions, type SourcingProject, type SourcingQuestion } from "@/lib/sourcing";
import { imageFileToDataUrl } from "@/lib/image-data-url";
import logo from "@/assets/snaplogo-orange.png";
import type { IntakeReply } from "../../supabase/functions/_shared/sourcing-intake";

const PROJECTS_KEY = "snaplogo.sourcing.projects";
const TEAM_WHATSAPP = "https://wa.me/917424960090?text=" + encodeURIComponent("Hi Snaplogo! I'd like to talk to a sourcing expert about my packaging requirement.");

const TEMPLATE = "I need [quantity] custom [box / pouch type] for my [product] brand — size [L×W×H cm], [material, e.g. 3-ply kraft], [printing, e.g. multicolour logo], budget ₹[price] per piece";

export default function SourcingAgent() {
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
  const input = useRef<HTMLTextAreaElement>(null);
  const project = projects.find(p => p.id === activeId);
  const turns = project?.turns ?? [];
  const current = turns.at(-1);
  const hasQuestions = !current?.questionsSkipped && (current?.questions?.length ?? 0) > 0;
  const askingPhone = !!current && !hasQuestions && !project?.submitted && (current.stage ? current.stage === "phone" || current.stage === "design" : true);
  const designStep = askingPhone && !!project && needsSourcingDesign(project);
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
    if (!project || busy || submitting) return;
    const updated = recordSourcingFollowUp(project);
    if (updated !== project) setProjects(prev => prev.map(p => p.id === project.id ? updated : p));
  }, [project, busy, submitting]);
  useEffect(() => {
    document.title = "Snaplogo Sourcing Agent | Share your packaging requirement";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Share your packaging requirements, answer a few focused questions and request a phone follow-up from Snaplogo.");
  }, []);
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
    setBusy(true); setError(""); setPendingQuery(trimmed); setLiveQuestions([]);
    const id = activeId ?? crypto.randomUUID();
    try {
      let questions: unknown = [];
      let reply: IntakeReply | undefined;
      {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/directory-search`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
          body: JSON.stringify({ query: sourcingRequest(turns, trimmed), latest: trimmed, images: photos, brief: project?.brief ?? [], mode: "intake", stream: true, conversational: true, quotationAsked: turns.some(t => t.stage === "quotation" || (t.questions?.length ?? 0) > 0), currentStage: current?.stage ?? (hasQuestions ? "quotation" : designStep ? "design" : askingPhone ? "phone" : "clarify"), conversation: turns.map(t => ({ request: t.query, response: t.assistantMessage, stage: t.stage, questions: t.questions ?? [], followUp: t.followUp, hasImages: (t.images?.length ?? 0) > 0, skipped: t.questionsSkipped ?? false })) }),
        });
        questions = await readSourcingStream(response, value => setLiveQuestions(turns.some(t => t.stage === "quotation" || (t.questions?.length ?? 0) > 0) ? [] : validatedQuestions(value, turns)), value => { reply = value; });
      }
      const turn = { query: trimmed, matches: [], questions: turns.some(t => t.stage === "quotation" || (t.questions?.length ?? 0) > 0) ? [] : validatedQuestions(questions, turns), images: photos, assistantMessage: reply?.message, stage: reply?.stage ?? "clarify" as const, hasRequirement: reply?.hasRequirement ?? false };
      setProjects(prev => prev.some(p => p.id === id) ? prev.map(p => p.id === id ? { ...p, brief: mergeSourcingBrief(p.brief, reply?.brief), designDone: p.designDone || reply?.stage === "phone", turns: [...p.turns, turn] } : p) : [{ id, title: trimmed.slice(0, 65), createdAt: new Date().toISOString(), brief: mergeSourcingBrief([], reply?.brief), turns: [turn] }, ...prev]);
      setActiveId(id); setQuery(""); setPhotos([]);
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Please try again."); }
    finally { setBusy(false); setPendingQuery(""); setLiveQuestions([]); }
  };
  const submitPhone = async (phone: string) => {
    const draft = { query: validSourcingPhone(query.trim()) ? "" : query, images: photos };
    const payload = sourcingSubmission(turns, phone, draft, project?.brief);
    if (!payload || busy || submitting || project?.submitted) return;
    setSubmitting(true); setError("");
    try {
      const { error: insertError } = await supabase.from("requirement_submissions").insert(payload);
      if (insertError) throw new Error("Your request couldn’t be sent. Please try again.");
      const phoneDisplay = phone.trim().startsWith("+") ? phone.trim() : `+91 ${phone.trim()}`;
      setProjects(prev => prev.map(p => p.id === activeId ? { ...p, submitted: true, phone: phone.trim(), turns: [...p.turns, { query: phoneDisplay, matches: [], images: draft.images }, ...(draft.query.trim() ? [{ query: draft.query.trim(), matches: [] }] : [])] } : p));
      setQuery(""); setPhotos([]);
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); }
    finally { setSubmitting(false); }
  };
  const composer = (compact = false) => (
    <form onSubmit={e => { e.preventDefault(); void search(); }} className={`sourcing-composer rounded-2xl border border-border bg-card p-3 sm:p-4 focus-within:ring-2 focus-within:ring-primary/20 ${compact ? "" : "mt-5 md:mt-7"}`}>
      <label htmlFor="sourcing-query" className="sr-only">{compact ? "Your answer" : "Packaging requirement"}</label>
      <textarea ref={input} id="sourcing-query" value={query} onChange={e => setQuery(e.target.value)} maxLength={500} disabled={busy || submitting} rows={compact ? 3 : 4} placeholder={designStep ? "Share a design or photo, or say you don’t have one…" : askingPhone ? "Add remaining details or your WhatsApp number…" : compact ? "Your answer, or any other details…" : "Describe what you need (e.g. 5,000 coffee boxes, 3-ply kraft, logo print)…"} className="w-full resize-none bg-transparent px-1 pt-1 text-base leading-relaxed sm:px-2 sm:pt-2 text-foreground outline-none placeholder:text-muted-foreground" onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void search(); } }} />
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
        <Button asChild variant="ghost" size="sm" className="mt-4 justify-start text-muted-foreground"><a href={TEAM_WHATSAPP} target="_blank" rel="noopener noreferrer"><MessageSquare />Talk to our team</a></Button>
      </aside>
      <div className="lg:ml-60">
        <header className="sticky top-0 z-10 flex h-12 items-center justify-between gap-2 border-b border-border bg-card/90 px-4 backdrop-blur md:h-16 md:px-10">
          <nav aria-label="Sections" className="flex items-center gap-1 text-sm"><Link to="/sourcing" className="mr-2 flex items-center gap-2 font-bold lg:hidden"><img src={logo} alt="" className="h-6 w-6" />snaplogo<span className="text-primary">.</span></Link><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hidden rounded-full bg-muted px-3 py-1.5 font-medium sm:inline">Workspace</button><button type="button" onClick={() => { if (current) startNew(); setTimeout(() => document.getElementById("browse-designs")?.scrollIntoView({ behavior: "smooth" }), 50); }} className="hidden rounded-full px-3 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground sm:inline">Browse designs</button></nav>
          <div className="flex items-center gap-1.5 sm:gap-2"><Button asChild size="sm" variant="outline" className="hidden h-8 rounded-full px-3 text-xs sm:inline-flex sm:h-9 sm:px-4 sm:text-sm"><a href={TEAM_WHATSAPP} target="_blank" rel="noopener noreferrer" aria-label="Talk to a sourcing expert"><MessageSquare />Talk to a sourcing expert</a></Button><Button onClick={startNew} disabled={busy || submitting} size="sm" aria-label="New sourcing request" className="h-8 rounded-full px-3 text-xs sm:h-9 sm:px-4 sm:text-sm lg:hidden"><Plus /><span>New Request</span></Button></div>
        </header>
        <main className="mx-auto max-w-[1000px] px-4 pb-12 md:px-10">
          {!current && !busy && <div className="mx-auto pb-4 pt-6 text-center sm:pt-8 md:pt-16">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold text-muted-foreground shadow-sm"><Sparkles className="h-3.5 w-3.5 text-primary" />AI Sourcing Engine</p>
            <h1 className="mx-auto mt-3 max-w-[760px] max-sm:max-w-[360px] text-[28px] font-bold leading-8 tracking-normal sm:text-[32px] sm:leading-[1.15] md:text-[52px]">Find verified packaging manufacturers</h1>
            <ul className="mx-auto mt-5 grid max-w-[860px] grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card py-3 shadow-sm sm:mt-6">{([["24h Quotes", Zap], ["100+ Vetted Suppliers", Handshake], ["0% Commission", ShieldCheck]] as const).map(([t, Icon]) => <li key={t} className="flex min-w-0 flex-col items-center gap-1 px-1 py-1 text-[11px] font-semibold text-foreground sm:flex-row sm:justify-center sm:gap-1.5 sm:text-sm"><Icon className="h-4 w-4 shrink-0 text-primary" /><span className="text-center leading-tight">{t}</span></li>)}</ul>
            <div className="mx-auto max-w-[860px] text-left">{composer()}</div>
            <CorrugatedDesigns onUseDesign={(prefill, designs) => {
              setQuery(previous => previous.trim() ? `${previous}\n\n${prefill}` : prefill); setError("");
              input.current?.focus(); input.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              void designReferenceImage(designs).then(image => setPhotos(previous => [...previous, image].slice(0, 4))).catch(e => setError(e instanceof Error ? e.message : "Couldn’t attach the design reference."));
            }} />
          </div>}
          {(current || busy) && <div ref={chatAnchor} className="mx-auto max-w-[860px] scroll-mt-20 py-8">
            <ol className="sourcing-composer mb-8 flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-5 md:px-7" aria-label="Progress">{["Requirements", "Brief", "Contact"].map((label, i) => { const step = project?.submitted ? 3 : askingPhone ? 2 : project?.brief?.length ? 1 : 0; const done = i < step; const active = i === step; return <li key={label} className="flex flex-1 items-center gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${done ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{done ? <Check className="h-4 w-4" /> : i + 1}</span><span className={`hidden min-w-0 text-sm font-semibold md:block ${done || active ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>{i < 2 && <span className={`h-px min-w-4 flex-1 ${done ? "bg-primary" : "bg-border"}`} />}</li>; })}</ol>
            <div className="space-y-6">{turns.map((turn, index) => <div key={index} className="space-y-6"><div className="flex justify-end gap-2 sm:gap-3"><div className="max-w-[80%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary px-4 py-3 sm:px-6 sm:py-4 text-[15px] md:text-base text-primary-foreground shadow-sm">{turn.query}{(turn.images?.length ?? 0) > 0 && <div className="mt-2 flex flex-wrap gap-2">{turn.images?.map((src, i) => <img key={i} src={src} alt={`Photo ${i + 1}`} className="h-24 w-24 rounded-lg object-cover" />)}</div>}</div><span className="mt-1 flex h-7 w-7 shrink-0 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-accent text-accent-foreground"><User className="h-4 w-4" /></span></div>{turn.assistantMessage && <div className="flex max-w-full gap-2 sm:max-w-[90%] sm:gap-3"><img src={logo} alt="" className="mt-1 h-7 w-7 shrink-0 rounded-full sm:h-10 sm:w-10 border border-border bg-card p-1.5" /><div className="sourcing-composer whitespace-pre-wrap rounded-2xl rounded-tl-md border border-border bg-card px-4 py-4 sm:px-6 sm:py-5 text-[15px] md:text-base leading-relaxed">{turn.assistantMessage}</div></div>}{(turn.questions?.length ?? 0) > 0 && <div className="flex max-w-full gap-2 sm:max-w-[90%] sm:gap-3"><img src={logo} alt="" className="mt-1 h-7 w-7 shrink-0 rounded-full sm:h-10 sm:w-10 border border-border bg-card p-1.5" /><div className="sourcing-composer rounded-2xl rounded-tl-md border border-border bg-card px-4 py-4 sm:px-6 sm:py-5 text-[15px] md:text-base leading-relaxed"><p className="mb-3 font-semibold text-foreground">A few quick details would help</p><ul className="space-y-3">{turn.questions?.map((q, qi) => <li key={q.topic} className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">{qi + 1}</span><span className="pt-1">{q.question}</span></li>)}</ul>{turn.questionsSkipped && <p className="mt-2 text-xs text-muted-foreground">Skipped</p>}</div></div>}{turn.followUp && <div className="flex max-w-full gap-2 sm:max-w-[90%] sm:gap-3"><img src={logo} alt="" className="mt-1 h-7 w-7 shrink-0 rounded-full sm:h-10 sm:w-10 border border-border bg-card p-1.5" /><div className="sourcing-composer rounded-2xl rounded-tl-md border border-border bg-card px-4 py-4 sm:px-6 sm:py-5 text-[15px] md:text-base leading-relaxed"><p className="font-semibold text-foreground">{turn.followUp === "design" ? "Do you have any design with you?" : "Please share your WhatsApp number"}</p><p className="mt-1 text-muted-foreground">{turn.followUp === "design" ? "Helps manufacturers quote accurately — totally optional." : "We’ll send manufacturer details and quotation on WhatsApp."}</p></div></div>}</div>)}{busy && <div className="ml-auto max-w-[80%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary px-4 py-3 sm:px-6 sm:py-4 text-[15px] md:text-base text-primary-foreground">{pendingQuery}</div>}</div>
            {busy ? <div className="py-6" role="status">{liveQuestions.length > 0 && <div className="mb-4 flex max-w-full gap-2 sm:max-w-[90%] sm:gap-3"><img src={logo} alt="" className="h-10 w-10 shrink-0 rounded-full border border-border bg-card p-1.5" /><div className="sourcing-composer rounded-2xl border border-border bg-card px-4 py-4 sm:px-6 sm:py-5 text-[15px] md:text-base leading-relaxed"><p className="mb-3 font-semibold">A few quick details would help</p><ol className="space-y-3">{liveQuestions.map((q, i) => <li key={q.topic} className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">{i + 1}</span><span className="pt-1">{q.question}</span></li>)}</ol></div></div>}<div className="flex items-center gap-3 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" />Reviewing your packaging details…</div></div> : project?.submitted ? <section role="status" className="sourcing-composer mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
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
                <Button asChild variant="outline" className="rounded-full sm:flex-none"><a href={TEAM_WHATSAPP} target="_blank" rel="noopener noreferrer"><MessageSquare />Talk to our team</a></Button>
              </div>
            </section> : <>
              {askingPhone && !designStep && <div className="mb-5 border-l-2 border-primary pl-4"><h3 className="text-sm font-semibold">What happens next</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">We match manufacturers and share quotes on WhatsApp.</p></div>}
              <div className="mt-6">{composer(true)}</div>
              {submitting && <p role="status" className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />Sending your request…</p>}
              {hasQuestions && <div className="mt-2 flex justify-end"><Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => void search("Skip the optional quotation details for now; use my packaging requirement.")}>Skip for now<ArrowRight /></Button></div>}
            </>}
          </div>}
          {error && <div role="alert" className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-card p-4 text-sm text-destructive"><span className="flex-1">{error}</span><Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Dismiss error" onClick={() => setError("")}><X /></Button></div>}
        </main>
        <footer className="mx-auto flex max-w-[900px] flex-wrap items-center justify-between gap-2 border-t border-border/60 px-5 py-6 text-xs text-muted-foreground md:px-10"><span>© {new Date().getFullYear()} Snaplogo · India</span></footer>
      </div>
    </div>
  );
}
