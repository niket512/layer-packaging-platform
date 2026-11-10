import { MessageResponse } from "@/components/ai-elements/message";
import TrustStory from "@/components/sourcing/TrustStory";
import { RequirementForm } from "@/components/sourcing/RequirementForm";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { sourcingLandingFamily } from "@/lib/sourcing-landing";
import { ArrowLeftRight, ArrowRight, ArrowUp, ArrowUpRight, Check, ChevronRight, Loader2, ImagePlus, MessageSquare, Plus, ShieldCheck, User, Users, X, Zap, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CorrugatedDesigns } from "@/components/sourcing/CorrugatedDesigns";
import { designReferenceImage } from "@/components/sourcing/design-reference-image";
import { DESIGN_PREFILL_KEY } from "@/pages/Designs";
import type { PackagingDesign } from "@/components/sourcing/packaging-catalogue";
import { SourcingBrief } from "@/components/sourcing/SourcingBrief";
import { ManufacturerNetwork } from "@/components/sourcing/ManufacturerNetwork";
import { supabase } from "@/integrations/supabase/client";
import { looksLikeSourcingPhone, mergeSourcingBrief, sourcingProjectTitle, needsSourcingDesign, recordSourcingFollowUp, readSourcingStream, readSaved, sourcingRequest, sourcingSubmission, validSourcingPhone, validatedQuestions, type SourcingProject, type SourcingQuestion } from "@/lib/sourcing";
import { imageFileToDataUrl } from "@/lib/image-data-url";
import { syncSourcingChat } from "@/lib/chat-monitoring";
import { trackFunnel, flushVisitorTracking } from "@/lib/visitor-tracking";
import logo from "@/assets/snaplogo-orange.png";
import catBoxes from "@/assets/design-ship-kraft.jpg";
import catPouches from "@/assets/category-stand-up-pouches.jpg";
import catLabels from "@/assets/cat-labels.jpg";
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

type SourceCategoryId = "boxes" | "pouches" | "labels";
const SOURCE_CATEGORIES: { id: SourceCategoryId; label: string; image: string; context: string; placeholder: string; suggestions: string[] }[] = [
  { id: "boxes", label: "Corrugated Boxes", image: catBoxes, context: "Corrugated boxes", placeholder: "I need 5,000 kraft shipping boxes, approximately 12 x 10 x 8 inches…", suggestions: ["Shipping boxes", "E-commerce mailers", "Product boxes", "Die-cut boxes", "Printed boxes"] },
  { id: "pouches", label: "Flexible Pouches", image: catPouches, context: "Flexible pouches", placeholder: "I need 5,000 stand-up zipper pouches for my snack brand…", suggestions: ["Stand-up pouches", "Flat pouches", "Pillow pouches", "Flat-bottom pouches", "Spout pouches", "Sachets & stick packs"] },
  { id: "labels", label: "Labels & Stickers", image: catLabels, context: "Labels and stickers", placeholder: "I need 1,000 waterproof labels for my skincare bottles…", suggestions: [] },
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

export default function SourcingAgent({ category, requirementMode = "chat" }: { category?: SourcingCategory; requirementMode?: "chat" | "form" } = {}) {
  const location = useLocation();
  const landingFamily = sourcingLandingFamily(category, location.search);
  const [packagingFamily, setPackagingFamily] = useState(landingFamily);
  useEffect(() => { setPackagingFamily(landingFamily); }, [landingFamily]);
  const [formKey, setFormKey] = useState(0);
  const [formActive, setFormActive] = useState(false);
  const [designFormOpen, setDesignFormOpen] = useState(false);
  useEffect(() => {
    if (!designFormOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = document.querySelector<HTMLElement>('[aria-label="Request quotes for selected design"]');
    const before = document.activeElement;
    dialog?.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDesignFormOpen(false);
      if (event.key !== "Tab" || !dialog) return;
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled):not([type="hidden"]), textarea:not(:disabled), summary, [tabindex="0"]')).filter(node => node.getClientRects().length > 0);
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener("keydown", dismiss);
    return () => { document.body.style.overflow = overflow; window.removeEventListener("keydown", dismiss); if (before instanceof HTMLElement) before.focus({ preventScroll: true }); };
  }, [designFormOpen]);
  const [formDesigns, setFormDesigns] = useState<PackagingDesign[]>([]);
  const landing = category ? LANDINGS[category] : undefined;
  const navigate = useNavigate();
  const [projects, setProjects] = useState<SourcingProject[]>(() => {
    const saved = readSaved<unknown>(PROJECTS_KEY, []);
    return Array.isArray(saved) ? saved.filter(p => p && typeof p.id === "string" && typeof p.title === "string" && Array.isArray(p.turns)) : [];
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [sourceCategory, setSourceCategory] = useState<SourceCategoryId | null>(null);
  const selectedSource = SOURCE_CATEGORIES.find(c => c.id === sourceCategory);
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
      if (saved.designs?.length) setFormDesigns(saved.designs);
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

  const startNew = () => { if (busy || submitting) return; setFormKey(k => k + 1); setFormActive(false); setActiveId(null); setQuery(""); setPhotos([]); setError(""); input.current?.focus(); };
  const search = async (text = query) => {
    const trimmed = text.trim() || (photos.length ? "Photos attached" : "");
    if (askingPhone && !designStep && validSourcingPhone(trimmed)) { void submitPhone(trimmed); return; }
    if (askingPhone && !designStep && looksLikeSourcingPhone(trimmed)) { setError("That doesn’t look like a valid WhatsApp number. Please share a 10-digit number, e.g. 98765 43210."); return; }
    if (!trimmed || busy || submitting || project?.submitted) return;
    if (!turns.length) trackFunnel("first_message");
    // A picked category silently scopes the first message without changing what the user typed.
    const outgoing = !turns.length && selectedSource ? `${selectedSource.context}: ${trimmed}` : trimmed;
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
          body: JSON.stringify({ query: sourcingRequest(turns, outgoing), latest: outgoing, images: photos, brief: project?.brief ?? [], mode: "intake", stream: true, conversational: true, quotationAsked: turns.some(t => t.stage === "quotation" || (t.questions?.length ?? 0) > 0), currentStage: current?.stage ?? (hasQuestions ? "quotation" : designStep ? "design" : askingPhone ? "phone" : "clarify"), conversation: turns.map(t => ({ request: t.query, response: t.assistantMessage, stage: t.stage, questions: t.questions ?? [], followUp: t.followUp, hasImages: (t.images?.length ?? 0) > 0, skipped: t.questionsSkipped ?? false })) }),
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
      window.__lovableEvents?.track?.("project.sourcing_request_submitted", { channel: "chat" });
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
  useLayoutEffect(() => {
    const element = input.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(192, Math.max(128, element.scrollHeight))}px`;
  }, [query, !!(current || busy)]);
  const composer = (compact = false) => (
    <form onSubmit={e => { e.preventDefault(); void search(); }} className={`sourcing-composer border border-border bg-card shadow-sm p-2 sm:p-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 ${compact ? "rounded-b-2xl rounded-t-none" : "rounded-2xl mt-3 md:mt-5"}`}>
      <label htmlFor="sourcing-query" className="sr-only">{compact ? "Your answer" : "Packaging requirement"}</label>
      <textarea ref={input} id="sourcing-query" value={query} onChange={e => setQuery(e.target.value)} onFocus={() => trackFunnel("composer_focused")} maxLength={500} disabled={busy || submitting} rows={1} placeholder={designStep ? "Share a design or photo, or say you don’t have one…" : askingPhone ? "Your WhatsApp number, e.g. 98765 43210" : compact ? "Message Snaplogo…" : selectedSource?.placeholder ?? "I need 5,000 printed stand-up pouches for my snack brand…"} className="block min-h-32 max-h-48 w-full resize-none bg-transparent px-2 py-2.5 text-base leading-6 text-foreground outline-none placeholder:text-muted-foreground" onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && !window.matchMedia("(pointer: coarse)").matches) { e.preventDefault(); void search(); } }} />
      {photos.length > 0 && <div className="flex flex-wrap gap-2 px-2 pt-2">{photos.map((src, i) => <div key={i} className="relative"><img src={src} alt={`Attached photo ${i + 1}`} className="h-16 w-16 rounded-lg border border-border object-cover" /><button type="button" aria-label="Remove photo" onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background"><X className="h-3 w-3" /></button></div>)}</div>}
      <div className="mt-1 flex items-center justify-between gap-2"><div className="flex items-center gap-1"><input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={e => void addPhotos(e.target.files)} /><Button type="button" variant="ghost" size="sm" disabled={busy || submitting || photos.length >= 4} onClick={() => fileInput.current?.click()} className="h-11 rounded-full px-2 text-xs text-muted-foreground sm:text-sm"><ImagePlus /><span className="sm:hidden">Upload design</span><span className="hidden sm:inline">Add design / photos <span className="font-normal text-muted-foreground/70">(optional)</span></span></Button></div>{compact ? <Button type="submit" size="icon" disabled={busy || submitting || (!query.trim() && !photos.length)} aria-label="Send answer" className="h-11 w-11 shrink-0 rounded-full shadow-sm disabled:opacity-100 disabled:bg-primary/70">{busy || submitting ? <Loader2 className="animate-spin" /> : <ArrowUp />}</Button> : <Button type="submit" disabled={busy || submitting || (!query.trim() && !photos.length)} className="h-11 shrink-0 rounded-full px-3 text-[11px] font-bold uppercase tracking-wide shadow-sm disabled:opacity-100 disabled:bg-primary/70 sm:px-5 sm:text-[13px]">{busy || submitting ? <Loader2 className="animate-spin" /> : <><span className="sm:hidden">Free quotes</span><span className="hidden sm:inline">{landing?.cta ?? "Get Free Quotes"}</span><ArrowRight /></>}</Button>}</div>
    </form>
  );
  const designGallery = (
    <CorrugatedDesigns selectedFamily={requirementMode === "form" ? packagingFamily : undefined} onFamilyChange={requirementMode === "form" ? setPackagingFamily : undefined} onUseDesign={(prefill, designs) => {
      if (requirementMode === "form") {
        setFormDesigns(designs);
        setFormActive(true);
        setDesignFormOpen(true);
        setQuery(prefill);
        setError("");
        void designReferenceImage(designs).then(image => setPhotos([image])).catch(e => setError(e instanceof Error ? e.message : "Couldn’t attach the design reference."));
        return;
      }
      setQuery(previous => previous.trim() ? `${previous}\n\n${prefill}` : prefill); setError("");
      input.current?.focus(); input.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      void designReferenceImage(designs).then(image => setPhotos(previous => [...previous, image].slice(0, 4))).catch(e => setError(e instanceof Error ? e.message : "Couldn’t attach the design reference."));
    }} />
  );
  const sourcingQuestions = (
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
            <div className="flex items-center gap-2"><Button onClick={startNew} disabled={busy || submitting} size="sm" aria-label="New sourcing request" className="h-9 rounded-full px-4 text-sm"><Plus /><span>New Request</span></Button></div>
          </div>
        </header>
        <main className="mx-auto max-w-[1280px] px-4 pb-12 md:px-8">
          <div className="mx-auto pb-4 text-center">
            <section aria-label={requirementMode === "form" ? "Guided sourcing request" : "Sourcing chat"} className={`mx-auto flex max-w-[820px] flex-col text-left ${requirementMode === "form" ? "pt-4 pb-2 sm:pt-4 sm:pb-3" : "pt-4 pb-3 sm:pt-6 sm:pb-4"}`}>
            <div className="text-center">
            <div className={`relative mx-auto w-full max-w-[820px] `}>
<div ref={intro}>
            <div className="relative text-center">
              {landing && requirementMode === "chat" && <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-3 py-1 text-[11px] font-semibold text-primary sm:text-xs"><span className="h-1.5 w-1.5 rounded-full bg-primary" />100+ vetted manufacturers across India</span>}
              <h1 className={`mx-auto max-w-[720px] font-bold tracking-normal text-foreground ${requirementMode === "form" ? "mt-3 text-[28px] leading-[32px] sm:mt-3 sm:text-[32px] sm:leading-[1.15]" : "mt-3 text-[28px] leading-[32px] sm:mt-4 sm:text-[48px] sm:leading-[1.15]"}`}>{landing ? landing.headline : requirementMode === "chat" ? <>Compare Quotes from 100+ Vetted Factories&nbsp;<span className="text-primary">on WhatsApp&nbsp;in 4 Hours .</span></> : <>Compare Quotes from 100+ Vetted Factories<br className="hidden sm:block" /> <span className="text-primary">on WhatsApp in 4 Hours .</span></>}</h1>
              {!landing && requirementMode === "chat" && <p className="mx-auto mt-2 max-w-[580px] text-sm font-medium leading-snug text-muted-foreground sm:text-base">Zero brokerage · Direct factory pricing · Low MOQs</p>}
              {landing && <p className="mx-auto mt-3 max-w-[580px] text-sm leading-relaxed text-muted-foreground sm:text-base">{landing.copy}</p>}
              <ol className={`mx-auto grid max-w-[720px] grid-cols-3 text-center ${requirementMode === "form" ? "mb-2 mt-3 sm:mb-3" : "mb-3 mt-3 sm:mb-4"}`} aria-label="How it works">{["Tell us your needs", "We find manufacturers", "Compare multiple quotes within 4 hours"].map((t, i) => <li key={t} className="relative px-1">{i < 2 && <span aria-hidden="true" className={`absolute left-1/2 h-px w-full bg-border ${requirementMode === "form" ? "top-3" : "top-4"}`} />}<span className={`relative mx-auto flex items-center justify-center rounded-full border border-primary/30 bg-card font-bold text-primary ${requirementMode === "form" ? "h-6 w-6 text-xs" : "h-8 w-8 text-sm"}`}>{i + 1}</span><p className={`font-semibold text-foreground ${requirementMode === "form" ? "mt-1 text-xs leading-4" : "mt-1 text-xs sm:text-sm"}`}>{t}</p></li>)}</ol>
            </div>
            </div>
            {requirementMode === "chat" && (current || busy) && (
            <div ref={transcript} role="region" aria-label="Conversation" className="mt-3 max-h-[min(38dvh,320px)] overflow-y-auto overscroll-contain rounded-t-2xl border border-b-0 border-border bg-card px-4 py-4 text-left [overflow-anchor:none] sm:px-6 sm:py-5 sm:max-h-[min(48dvh,480px)]">
            
            <div className="space-y-5">{turns.map((turn, index) => <div key={index} className="space-y-3"><div className="flex justify-end gap-2 sm:gap-3"><div className="max-w-[85%] whitespace-pre-wrap [overflow-wrap:anywhere] rounded-[20px] rounded-br-md bg-muted px-4 py-2.5 text-[15px] leading-relaxed md:text-base text-foreground">{turn.query}{(turn.images?.length ?? 0) > 0 && <div className="mt-2 flex flex-wrap gap-2">{turn.images?.map((src, i) => <img key={i} src={src} alt={`Photo ${i + 1}`} className="h-24 w-24 rounded-lg object-cover" />)}</div>}</div></div>{turn.assistantMessage && <p className="flex items-center gap-2 pt-2 text-xs font-semibold text-foreground"><img src={logo} alt="" className="h-5 w-5 object-contain" />Snaplogo</p>}{turn.assistantMessage && <div className="flex max-w-full"><div className="min-w-0 max-w-full rounded-lg bg-accent/60 px-3 py-2 text-[15px] leading-7 [overflow-wrap:anywhere] md:text-base"><MessageResponse>{turn.assistantMessage}</MessageResponse></div></div>}{(turn.questions?.length ?? 0) > 0 && <div className="flex max-w-full"><div className="min-w-0 max-w-full rounded-lg bg-accent/60 px-3 py-2 text-[15px] leading-7 [overflow-wrap:anywhere] md:text-base"><p className="mb-2 font-medium text-foreground">A few quick details would help</p><ul className="space-y-3">{turn.questions?.map((q, qi) => <li key={q.topic} className="flex items-start gap-2.5"><span className="shrink-0 text-sm font-medium text-muted-foreground">{qi + 1}</span><span>{q.question}</span></li>)}</ul>{turn.questionsSkipped && <p className="mt-2 text-xs text-muted-foreground">Skipped</p>}</div></div>}{turn.followUp && <div className="flex max-w-full"><div className="min-w-0 max-w-full rounded-lg bg-accent/60 px-3 py-2 text-[15px] leading-7 [overflow-wrap:anywhere] md:text-base">{turn.followUp === "design" ? <><p className="font-semibold text-foreground">Do you have any design with you?</p><p className="mt-1 text-muted-foreground">Helps manufacturers quote accurately — totally optional.</p></> : <>{askingPhone && !designStep && index === turns.length - 1 && <SourcingBrief fields={project?.brief ?? []} onSave={fields => setProjects(prev => prev.map(p => p.id === activeId ? { ...p, brief: fields.filter(f => f.value.trim()) } : p))} />}<p className="mt-1">We’ll now take your packaging requirements to our manufacturer network and share quotations from multiple manufacturers within 4 hours. <strong className="font-semibold text-foreground">Kindly share your phone number to keep you updated.</strong></p></>}</div></div>}</div>)}{busy && <div className="ml-auto max-w-[85%] whitespace-pre-wrap [overflow-wrap:anywhere] rounded-[20px] rounded-br-md bg-muted px-4 py-2.5 text-[15px] leading-relaxed md:text-base text-foreground">{pendingQuery}</div>}</div>
            {busy && <div className="py-3" role="status" aria-label="Snaplogo is reviewing your request">{liveMessage && <div className="mb-4 flex max-w-full gap-2 sm:max-w-full sm:gap-3"><div className="min-w-0 max-w-full rounded-lg bg-accent/60 px-3 py-2 text-[15px] leading-7 [overflow-wrap:anywhere] md:text-base"><MessageResponse>{liveMessage}</MessageResponse></div></div>}{liveQuestions.length > 0 && <div className="mb-4 flex max-w-full gap-2 sm:max-w-full sm:gap-3"><div className="min-w-0 max-w-full rounded-lg bg-accent/60 px-3 py-2 text-[15px] leading-7 [overflow-wrap:anywhere] md:text-base"><p className="mb-3 font-semibold">A few quick details would help</p><ol className="space-y-3">{liveQuestions.map((q, i) => <li key={q.topic} className="flex items-start gap-2.5"><span className="shrink-0 text-sm font-medium text-muted-foreground">{i + 1}</span><span>{q.question}</span></li>)}</ol></div></div>}<div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" />Reviewing your packaging details…</div></div>}{project?.submitted ? <section role="status" className="sourcing-composer mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--sourcing-success))] text-white shadow-sm"><Check className="h-6 w-6" /></span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-semibold tracking-tight">Your sourcing brief is submitted</h2>
                  {project.phone && <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><span>We’ll message you on</span><span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-sm font-semibold text-foreground"><MessageSquare className="h-3.5 w-3.5 text-[hsl(var(--sourcing-success))]" />{project.phone.trim().startsWith("+") ? project.phone.trim() : `+91 ${project.phone.trim()}`}</span></p>}
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Shortlisting from <span className="font-semibold text-foreground">100+ vetted manufacturers</span> — quotations <span className="font-semibold text-foreground">within 4 hours</span>.</p>
                </div>
              </div>
              <ol aria-label="What happens next" className="mt-8 grid gap-4 rounded-xl border border-border/70 bg-background/60 p-4 sm:grid-cols-3 md:p-5">{[[true, "Brief received", "With our sourcing team"], [false, "Manufacturer matching", "From 100+ vetted makers"], [false, "Quote on WhatsApp", "Details & pricing in 4 hrs"]].map(([done, label, sub], i) => <li key={label as string} className="flex items-start gap-2.5"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${done ? "border-transparent bg-[hsl(var(--sourcing-success))] text-white" : "border-border bg-card text-muted-foreground"}`}>{done ? <Check className="h-4 w-4" /> : i + 1}</span><span className="min-w-0"><span className="block text-sm font-semibold">{label}</span><span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{sub}</span></span></li>)}</ol>
              <SourcingBrief fields={project.brief ?? []} submitted onSave={fields => setProjects(prev => prev.map(p => p.id === activeId ? { ...p, brief: fields.filter(f => f.value.trim()) } : p))} />
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button onClick={startNew} className="rounded-full sm:flex-none"><Plus />New sourcing request</Button>
              </div>
            </section> : <>
              {submitting && <p role="status" className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />Sending your request…</p>}
              {hasQuestions && <div className="mt-1 flex justify-start"><Button variant="ghost" size="sm" disabled={busy || submitting} className="h-9 px-1 text-xs text-muted-foreground" onClick={() => void search("Skip the optional quotation details for now; use my packaging requirement.")}>Skip for now<ArrowRight /></Button></div>}
            </>}
            </div>
            )}
            </div>
            {requirementMode === "chat" && !(current || busy) && !landing && (
              <div className="mx-auto w-full max-w-[820px]">
                <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
                  {SOURCE_CATEGORIES.map(c => (
                    <div key={c.id} className="overflow-hidden rounded-lg border border-border bg-card text-left">
                      <img src={c.image} alt="" loading="lazy" className="h-14 w-full object-cover sm:h-20" />
                      <span className={`flex min-h-11 w-full items-center px-2 py-1.5 text-[11px] font-semibold leading-snug sm:min-h-10 sm:px-3 sm:text-sm ${sourceCategory === c.id ? "text-primary" : "text-foreground"}`}>{c.label}</span>
                    </div>
                  ))}
                </div>
                {selectedSource && selectedSource.suggestions.length > 0 && (
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {selectedSource.suggestions.map(s => <button key={s} type="button" onClick={() => { setQuery(prev => prev.trim() ? prev : `I need ${s.toLowerCase()} for my brand — `); input.current?.focus(); }} className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">{s}</button>)}
                  </div>
                )}
              </div>
            )}
            {requirementMode === "form" ? <div role={designFormOpen ? "dialog" : undefined} aria-modal={designFormOpen || undefined} aria-label={designFormOpen ? "Request quotes for selected design" : undefined} className={designFormOpen ? "fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-background/95 p-3 backdrop-blur-sm sm:p-6" : ""}>
              <div className={designFormOpen ? "w-full max-w-[820px] text-left" : ""}>
                {designFormOpen && <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Request quotes</h2><Button type="button" variant="outline" size="sm" className="h-11 rounded-full" onClick={() => setDesignFormOpen(false)}><X />Back to designs</Button></div>}
                <RequirementForm key={`${formKey}-${landingFamily}`} family={packagingFamily} onFamilyChange={setPackagingFamily} reference={query} referencePhotos={photos} referenceDesigns={formDesigns} onActive={() => setFormActive(true)} />
              </div>
            </div> : <div className={`mx-auto w-full max-w-[820px] text-left `}>{composer(!!(current || busy))}{error && <div role="alert" className="mt-2 flex items-center gap-2 rounded-lg border border-destructive/30 bg-card px-3 py-2 text-sm text-destructive"><span className="min-w-0 flex-1">{error}</span><Button variant="ghost" size="icon" className="h-11 w-11 shrink-0" aria-label="Dismiss error" onClick={() => setError("")}><X /></Button></div>}</div>}
            {!(current || busy) && <p className="mx-auto mt-3 max-w-[820px] text-center text-xs text-muted-foreground">Free to request · No commission · Confidential designs</p>}
            </div></section>
            <TrustStory />
              <div className="mx-auto mt-5 grid max-w-[1120px] items-start gap-6 border-t border-border pt-6 text-left sm:mt-8 sm:grid-cols-2 sm:gap-8 sm:pt-8">
              <div className={requirementMode === "form" ? "order-2" : ""}><ManufacturerNetwork /></div>
              <div className={`min-w-0 ${requirementMode === "form" ? "order-1" : ""}`}>
              <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Compare manufacturer quotes.</h2>
              <figure className="mx-auto mt-4 w-full overflow-hidden rounded-lg border border-border bg-card text-left">
                <figcaption className="flex items-center justify-between border-b border-border px-4 py-2.5 text-xs"><span className="font-semibold text-foreground">What you receive</span><span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Illustrative example</span></figcaption>
                <table className="w-full text-xs sm:text-sm"><thead className="text-muted-foreground"><tr><th className="px-4 py-2 text-left font-medium">Manufacturer</th><th className="px-2 py-2 text-right font-medium whitespace-nowrap">Per unit</th><th className="px-2 py-2 text-right font-medium">MOQ</th><th className="px-4 py-2 text-right font-medium whitespace-nowrap"><span className="sm:hidden">Lead</span><span className="hidden sm:inline">Lead time</span></th></tr></thead><tbody>{[["Maker A", "₹—", "1,000", "10 days", true], ["Maker B", "₹—", "2,000", "14 days", false], ["Maker C", "₹—", "500", "12 days", false]].map(([m, pr, moq, lt, best]) => <tr key={m as string} className="border-t border-border"><td className="px-4 py-2.5 font-medium text-foreground">{m}{best && <span className="ml-2 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-primary">Best fit</span>}</td><td className="px-2 py-2.5 text-right text-muted-foreground">{pr}</td><td className="px-2 py-2.5 text-right">{moq}</td><td className="px-4 py-2.5 text-right">{lt}</td></tr>)}</tbody></table>
              </figure>
              </div>
              </div>
            {(
              <a href="https://chat.whatsapp.com/I0vypMLz6bEKIeViw8rwh6" target="_blank" rel="noopener noreferrer" onClick={() => window.__lovableEvents?.track?.("project.whatsapp_group_opened", { placement: "card" })} className="group mx-auto mt-4 flex max-w-[820px] items-center gap-3 rounded-2xl border border-[hsl(var(--sourcing-success)/0.25)] bg-[hsl(var(--sourcing-success)/0.06)] px-3.5 py-3 text-left transition-colors hover:bg-[hsl(var(--sourcing-success)/0.1)] sm:px-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--sourcing-success))] text-white"><MessageSquare className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-snug text-foreground sm:text-[15px]">Brands and Manufacturers Group</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--sourcing-success))]" />100+ Brands · 20+ Manufacturers</span>
                </span>
                <span className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-[hsl(var(--sourcing-success))] px-4 text-xs font-bold uppercase tracking-wide text-white"><span className="sm:hidden">Join</span><span className="hidden sm:inline">Join WhatsApp community</span><ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
              </a>
            )}
            {designGallery}
            {requirementMode === "chat" && sourcingQuestions}
          </div>

        </main>
        <footer className="mx-auto flex max-w-[900px] flex-wrap items-center justify-between gap-2 border-t border-border/60 px-5 py-6 text-xs text-muted-foreground md:px-10"><span>© {new Date().getFullYear()} Snaplogo · India</span><nav className="flex flex-wrap items-center gap-1" aria-label="Site"><Button asChild variant="ghost" size="sm" className="text-muted-foreground"><Link to="/about">About</Link></Button><Button asChild variant="ghost" size="sm" className="text-muted-foreground"><Link to="/designs">Designs</Link></Button><Button asChild variant="ghost" size="sm" className="text-muted-foreground"><Link to="/blog">Packaging guides</Link></Button><Button asChild variant="ghost" size="sm" className="text-muted-foreground"><Link to="/team">Team</Link></Button><Button asChild variant="ghost" size="sm" className="text-muted-foreground"><Link to="/privacy-policy">Privacy</Link></Button><Button asChild variant="ghost" size="sm" className="text-muted-foreground"><a href={TEAM_WHATSAPP} target="_blank" rel="noopener noreferrer"><MessageSquare />Talk to our team</a></Button></nav></footer>
      </div>
      <CommunityPopup hidden={!!activeId || busy || formActive} />
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
          <p className="text-sm font-semibold text-foreground">Brands and Manufacturers Group</p>
          <p className="text-xs text-muted-foreground">Connect with the packaging community on WhatsApp</p>
        </div>
      </div>
      <a href="https://chat.whatsapp.com/I0vypMLz6bEKIeViw8rwh6" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="mt-2.5 flex h-9 w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--sourcing-success))] text-[13px] font-bold uppercase tracking-wide text-white hover:opacity-90">Join free on WhatsApp <ArrowRight className="h-4 w-4" /></a>
      <p className="mt-1.5 text-center text-[11px] text-muted-foreground">Free · No spam · Leave anytime</p>
    </div>
  );
}
