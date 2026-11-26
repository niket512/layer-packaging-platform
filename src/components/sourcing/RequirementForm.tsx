import { useEffect, useId, useRef, useState } from "react";
import { useHydrated } from "@tanstack/react-router";
import { useNavigate } from "@/lib/router-compat";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Loader2, X, MapPin, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FORM_FORMATS, FORM_STEPS, NOT_SURE_SIZE, SIZE_SUGGESTIONS, indianMobile, applyDesignToForm, designFormPrefill, formBrief, formSubmission, type FormFamily } from "@/lib/sourcing-form";
import type { PackagingDesign } from "./packaging-catalogue";
import { readAttribution } from "@/lib/attribution";
import { markConversionPending } from "@/lib/sourcing-conversion";
import { imageFileToDataUrl } from "@/lib/image-data-url";
import { supabase } from "@/integrations/supabase/client";
import { syncSourcingChat } from "@/lib/chat-monitoring";
import { flushVisitorTracking, trackFunnel, trackFormField, trackJourney } from "@/lib/visitor-tracking";
import type { SourcingBriefField } from "@/lib/sourcing-intake";
import boxesImage from "@/assets/design-ship-kraft.webp";
import pouchesImage from "@/assets/category-stand-up-pouches.webp";
import mailerImage from "@/assets/design-mailer-white.webp";
import printedImage from "@/assets/design-printed-kraft.webp";
import diecutImage from "@/assets/design-diecut-open.webp";
import flatImage from "@/assets/category-flat-pouches.webp";
import flatbottomImage from "@/assets/reference-flatbottom-pouch.webp";
import spoutImage from "@/assets/reference-spout-pouch.webp";

const STYLE_IMAGES: Record<string, string> = {
  "Shipping box": boxesImage, "Mailer box": mailerImage, "Product box": printedImage,
  "Die-cut box": diecutImage, "Gift box": mailerImage,
  "Stand-up pouch": pouchesImage, "Flat pouch": flatImage, "Flat-bottom pouch": flatbottomImage,
  "Spout pouch": spoutImage, "Sachet / stick pack": flatImage,
};
const STEPS = FORM_STEPS.map(step => step.label);
const DRAFT_KEY = "snaplogo.form.draft";
const draftKey = () => `${DRAFT_KEY}:${location.pathname}`;


export function RequirementForm({ family, onFamilyChange: setFamily, reference, referencePhotos, referenceDesigns, onActive, panelOpen = false, onlyFamily }: { family: FormFamily; onFamilyChange: (family: FormFamily) => void; reference: string; referencePhotos: string[]; referenceDesigns: PackagingDesign[]; onActive: () => void; panelOpen?: boolean; onlyFamily?: FormFamily }) {
  const navigate = useNavigate();
  const formId = useId();
  // The saved draft lives in this browser only, so it is restored after the server-rendered form hydrates.
  const hydrated = useHydrated();
  const hydratedAtMount = useRef(hydrated).current;
  const draft = useRef<{ step?: number; values?: Record<string, string>; phone?: string; notes?: string; id?: string } | null>(null);
  const readDraft = (): { step?: number; values?: Record<string, string>; phone?: string; notes?: string; id?: string } => { try { draft.current = !referenceDesigns.length ? JSON.parse(localStorage.getItem(draftKey()) ?? "{}") ?? {} : {}; } catch { draft.current = {}; } return draft.current ?? {}; };
  if (draft.current === null && hydratedAtMount) readDraft();
  const [step, setStep] = useState(() => Math.min(2, Math.max(0, draft.current?.step ?? 0)));
  const [values, setValues] = useState<Record<string, string>>(() => draft.current?.values ?? {});
  const [brief, setBrief] = useState<SourcingBriefField[]>([]);
  const [notes, setNotes] = useState(() => draft.current?.notes ?? "");
  const [phone, setPhone] = useState(() => draft.current?.phone ?? "");
  const earlySaved = useRef("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const id = useRef(draft.current?.id ?? crypto.randomUUID());
  const savedId = useRef(crypto.randomUUID());
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);
  useEffect(() => {
    setValues(previous => previous["format"] && !FORM_FORMATS[family].includes(previous["format"]) ? Object.fromEntries(Object.entries(previous).filter(([key]) => !["format", "wall", "closure", "material"].includes(key))) : previous);
  }, [family]);
  useEffect(() => {
    if (!hydrated || draft.current !== null) return;
    const saved = readDraft();
    if (saved.id) id.current = saved.id;
    if (saved.values) setValues(saved.values);
    if (saved.notes) setNotes(saved.notes);
    if (saved.phone) setPhone(saved.phone);
    const restoredStep = Math.min(2, Math.max(0, saved.step ?? 0));
    if (restoredStep) { previousStep.current = restoredStep; setStep(restoredStep); }
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (referenceDesigns.length || draft.current === null) return;
    try { localStorage.setItem(draftKey(), JSON.stringify({ step, values, phone, notes, id: id.current })); } catch { /* draft stays in memory */ }
  }, [referenceDesigns.length, step, values, phone, notes]);
  useEffect(() => { trackJourney({ kind: "form_step", step: String(step + 1) }); }, [step]);
  const recordedFields = useRef(new Set<string>());
  useEffect(() => {
    const completed: Record<string, boolean> = { ...Object.fromEntries(Object.entries(values).map(([key, value]) => [key, Boolean(value.trim())])), phone: Boolean(phone.trim()), notes: Boolean(notes.trim()), photos: photos.length + referencePhotos.length > 0 };
    for (const key of new Set([...recordedFields.current, ...Object.keys(completed)])) {
      if (completed[key] || recordedFields.current.has(key)) {
        trackFormField(key, completed[key] ?? false, step);
        recordedFields.current.add(key);
      }
    }
  }, [values, phone, notes, photos, referencePhotos, step]);
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    heading.current?.focus({ preventScroll: true });
    const form = heading.current?.closest("form");
    if (form && form.getBoundingClientRect().top < 64) form.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [step]);
  useEffect(() => {
    const prefill = applyDesignToForm(family, values, referenceDesigns, step);
    if (!prefill) return;
    setFamily(prefill.family);
    setValues(prefill.values);
    setStep(prefill.step);
    if (prefill.step === 3) setBrief(previous => {
      const refreshed = formBrief(prefill.family, prefill.values);
      const updatedTopics = new Set(["format", ...Object.keys(prefill.values).filter(key => prefill.values[key] !== values[key])]);
      return [...previous.filter(field => !updatedTopics.has(field.topic)), ...refreshed.filter(field => updatedTopics.has(field.topic))];
    });
    setError("");
    // Apply once per reference selection, not after each buyer edit or step change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referenceDesigns, setFamily]);
  useEffect(() => {
    if (!panelOpen || !referenceDesigns.length) return;
    // Wait for the selected attributes and the panel's entry animation before focusing.
    const timer = window.setTimeout(() => {
      const form = heading.current?.closest("form");
      if (!form) return;
      const topics = ["format", "quantity", "printing", "material", "delivery", "phone"];
      for (const topic of topics) {
        const control = form.querySelector<HTMLElement>(`[id="${formId}-${["format", "printing", "material"].includes(topic) ? "selected" : "form"}-${topic}"]`);
        if (!control) continue;
        const unanswered = control instanceof HTMLInputElement ? !control.value.trim() : control.textContent?.trim() === "Not selected";
        if (unanswered) { control.focus({ preventScroll: true }); control.scrollIntoView({ block: "nearest" }); break; }
      }
    }, 320);
    return () => window.clearTimeout(timer);
  }, [panelOpen, referenceDesigns, formId]);
  const change = (topic: string, value: string) => { onActive(); trackFormField(topic, Boolean(value.trim()), step); setValues(v => ({ ...v, [topic]: value })); };
  const choices = (topic: string, label: string, options: string[]) => <fieldset className="min-w-0"><legend className="mb-2 text-sm font-semibold">{label}</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{options.map(option => <Button key={option} type="button" size="sm" variant="outline" aria-pressed={values[topic] === option} onClick={() => change(topic, option)} className={`h-auto min-h-12 justify-between gap-2 whitespace-normal rounded-lg px-3 py-2 text-left text-sm normal-case tracking-normal transition-colors ${values[topic] === option ? "border-primary bg-accent text-primary ring-1 ring-primary hover:bg-accent" : "bg-background hover:border-primary/40"}`}><span>{option}</span><span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${values[topic] === option ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{values[topic] === option && <Check className="h-3 w-3" />}</span></Button>)}</div></fieldset>;
  const field = (topic: string, label: string, placeholder: string) => <div className="min-w-0"><label htmlFor={`${formId}-form-${topic}`} className="mb-1.5 flex flex-wrap items-baseline gap-1.5 text-sm font-semibold">{label.replace(" (optional)", "")}{label.includes("(optional)") && <span className="text-xs font-normal text-muted-foreground">Optional</span>}</label><Input id={`${formId}-form-${topic}`} className="h-11 rounded-lg bg-card text-base" value={values[topic] ?? ""} maxLength={240} placeholder={placeholder} onChange={e => change(topic, e.target.value)} /></div>;
  const allImages = [...referencePhotos, ...photos].slice(0, 4);
  const hasReference = referenceDesigns.length > 0;
  const detailLabels: Record<string, string> = { format: "Packaging style", quantity: "Quantity", printing: "Printing", material: "Material", closure: "Closure", delivery: "Delivery city", phone: "WhatsApp number" };
  const remainingDetails = ["format", "quantity", "printing", "material", "delivery", "phone"].filter(key => !(key === "phone" ? phone : values[key])?.trim());
  const addedDetails = ["format", "printing", "closure"].filter(key => values[key]?.trim());
  useEffect(() => {
    if (hasReference) { trackFunnel("brief_shown"); trackFunnel("contact_shown"); }
  }, [hasReference]);
  const changeDelivery = (value: string) => {
    change("delivery", value);
    setBrief(b => {
      const rest = b.filter(f => f.topic !== "delivery");
      return value.trim() ? [...rest, { topic: "delivery", value: value.trim(), source: "buyer" as const }] : rest;
    });
  };
  const saveEarlyContact = (number: string) => {
    if (earlySaved.current === number) return;
    earlySaved.current = number;
    void syncSourcingChat({ id: id.current, title: "Guided packaging request", brief: formBrief(family, values), submitted: false, phone: number, turns: [{ query: "Guided packaging request (in progress)", matches: [], images: [] }] }).catch(() => { earlySaved.current = ""; });
  };
  const advance = (skipPhone = false) => {
    if (step === 0 && !values["format"]) { trackJourney({ kind: "form_error", step: "1", reason: "format_required" }); setError("Choose a packaging style, or pick “Not sure, help me choose”."); return; }
    if (step === 1 && !skipPhone && phone.trim()) {
      const number = indianMobile(phone);
      if (!number) { trackJourney({ kind: "form_error", step: "2", reason: "phone_invalid" }); setError("Enter a 10-digit Indian mobile number, e.g. 98765 43210 — or skip for now."); return; }
      saveEarlyContact(number);
    }
    setError(""); onActive();
    if (step === 0) trackFunnel("contact_shown");
    if (step === 1) trackFunnel("brief_shown");
    setStep(s => Math.min(2, s + 1));
  };
  const submit = async (submittedBrief = brief) => {
    if (busy) return;
    const number = indianMobile(phone);
    if (!number) { trackJourney({ kind: "form_error", step: String(step + 1), reason: "phone_invalid" }); setError("Enter a 10-digit Indian mobile number so we can send your quotes, e.g. 98765 43210."); return; }
    const details = [notes, reference].filter(Boolean).join("\n\n");
    const payload = formSubmission(submittedBrief, number, details, allImages);
    if (!payload) return;
    setBusy(true); setError(""); trackFunnel("contact_submitted");
    try {
      const { error: insertError } = await supabase.from("requirement_submissions").insert({ ...payload, id: savedId.current, attribution: { ...readAttribution(), enquiry_id: savedId.current, submitted_at: new Date().toISOString() } });
      if (insertError) throw new Error("Your request couldn’t be sent. Please try again.");
      trackFunnel("request_saved"); window.__lovableEvents?.track?.("project.sourcing_request_submitted", { channel: "form" }); void flushVisitorTracking();
      await syncSourcingChat({ id: id.current, title: "Guided packaging request", brief: submittedBrief, submitted: true, submissionId: savedId.current, phone: number, turns: [{ query: payload.requirement, matches: [], images: allImages }] }).catch(() => {});
      markConversionPending(id.current);
      try { localStorage.removeItem(draftKey()); localStorage.setItem("snaplogo.sourcing.thankyou", JSON.stringify({ leadId: id.current, submissionId: savedId.current, phone: number, brief: submittedBrief })); } catch { /* Saved enquiry remains available. */ }
      navigate("/sourcing/thank-you");
    } catch (e) { trackJourney({ kind: "form_error", step: String(step + 1), reason: "save_failed" }); setError(e instanceof Error ? e.message : "Please try again."); }
    finally { setBusy(false); }
  };
  const presets = (topic: string, options: string[]) => <div className="mt-2 flex flex-wrap gap-2" aria-label={topic === "quantity" ? "Suggested quantities" : "Example dimensions"}>{options.map(value => <Button key={value} type="button" variant="outline" size="sm" aria-pressed={values[topic] === value} onClick={() => change(topic, value)} className={`h-11 rounded-full px-3 text-xs normal-case tracking-normal ${values[topic] === value ? "border-primary bg-accent text-primary" : "bg-card text-muted-foreground"}`}>{value}</Button>)}</div>;
  if (hasReference) {
    const prefilled = designFormPrefill(referenceDesigns)?.values ?? {};
    const compactChoice = (topic: string, label: string, options: string[], fromCatalogue = false) => {
      const catalogueSelected = fromCatalogue && Boolean(prefilled[topic]) && values[topic] === prefilled[topic];
      return <div className="min-w-0"><label className="mb-1.5 flex min-h-5 flex-wrap items-center justify-between gap-1 text-sm font-medium text-muted-foreground" htmlFor={`${formId}-selected-${topic}`}><span>{label}</span>{fromCatalogue && <span className={`flex items-center gap-1 text-xs ${catalogueSelected ? "text-primary" : "text-muted-foreground"}`}>{catalogueSelected && <Check className="h-3 w-3" />}{catalogueSelected ? "From catalogue" : "Your choice"}</span>}</label><Select value={values[topic] ?? ""} onValueChange={value => change(topic, value)}><SelectTrigger id={`${formId}-selected-${topic}`} aria-label={label} className={`h-11 min-w-0 text-base [&>span]:truncate ${catalogueSelected ? "border-primary/40 bg-accent text-foreground" : "bg-card"}`}><SelectValue placeholder="Not selected" /></SelectTrigger><SelectContent>{options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>;
    };
    return <form aria-label="Packaging requirement form" className="bg-card text-left sm:mt-3 sm:rounded-lg sm:border sm:border-border" onSubmit={event => {
      event.preventDefault();
      if (!values["format"]) { setError("Choose a packaging style, or select Not sure."); trackJourney({ kind: "form_error", step: "1", reason: "format_required" }); return; }
      const currentBrief = formBrief(family, values);
      setBrief(currentBrief); void submit(currentBrief);
    }}>
      <div className="sticky top-[60px] z-10 flex items-center gap-3 border-b border-border bg-card px-4 py-3 sm:px-6"><img src={referenceDesigns[0]?.image} alt="Selected packaging reference" className="h-14 w-14 shrink-0 rounded-md bg-muted object-contain" /><div className="min-w-0"><h2 ref={heading} tabIndex={-1} className="text-base font-semibold outline-hidden">Your packaging request</h2><p className="mt-0.5 break-words text-sm text-muted-foreground">{referenceDesigns.map(design => design.name).join(", ")}</p></div></div>
      <fieldset disabled={busy} className="min-w-0">
        <section aria-label="Selected specifications" className="grid min-w-0 grid-cols-1 gap-3 border-b border-border px-4 py-3 xs:grid-cols-2 sm:px-6">
          {([ ["format", "Packaging style", FORM_FORMATS[family]], ...(prefilled["printing"] ? [["printing", "Printing", ["Plain", "Logo only", "Multicolour", "Not sure"]]] : []), ...(prefilled["closure"] ? [["closure", "Closure", ["Heat seal", "Zipper", "Spout", "Not sure"]]] : []) ] as [string, string, string[]][]).map(([topic, label, options]) => <div key={topic}>{compactChoice(topic, label, options, true)}</div>)}
        </section>
        <section aria-label="Details from you" className="min-w-0 space-y-3 px-4 py-3 sm:px-6"><h3 className="text-sm font-semibold">A few details from you</h3>
          <div className="grid gap-3 sm:grid-cols-2"><div>{field("quantity", "Initial quantity", "e.g. 2,000 pieces")}{presets("quantity", ["500 pieces", "1,000 pieces", "5,000 pieces"])}</div>{field("size", family === "boxes" ? "Box dimensions (optional)" : "Dimensions or fill (optional)", family === "boxes" ? "Length × width × height in inches" : "e.g. 250 g or width × height in cm")}</div>
          <div className="grid gap-3 sm:grid-cols-2">{!prefilled["printing"] && compactChoice("printing", "Printing", ["Plain", "Logo only", "Multicolour", "Not sure"])}{compactChoice("material", "Material preference", family === "boxes" ? ["Kraft", "White-top", "Not sure"] : ["Mono-material", "Multilayer", "Paper-based", "Not sure"])}</div>
          <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">{family === "boxes" ? compactChoice("wall", "Corrugated wall · Optional", ["3-ply", "5-ply", "7-ply", "Not sure"]) : !prefilled["closure"] && compactChoice("closure", "Closure · Optional", ["Heat seal", "Zipper", "Spout", "Not sure"])}{compactChoice("finishing", "Finishing · Optional", ["Matte", "Gloss", "No preference"])}</div>
          <div className="space-y-3 border-t border-border pt-3"><h3 className="text-sm font-semibold">Quote updates</h3><div className="grid gap-3 sm:grid-cols-2">{field("delivery", "Delivery city", "e.g. Pune")}
            <div><label htmlFor={`${formId}-form-phone`} className="mb-1.5 block text-sm font-semibold">WhatsApp number</label><Input id={`${formId}-form-phone`} type="tel" autoComplete="tel" inputMode="tel" className="h-11 rounded-lg text-base" placeholder="+91 98765 43210" maxLength={25} value={phone} onChange={event => { setPhone(event.target.value); trackFormField("phone", Boolean(event.target.value.trim()), step); }} required /><p className="mt-1 text-xs text-muted-foreground">Your quotes will be sent on WhatsApp.</p></div></div>
            <div><label htmlFor={`${formId}-form-notes`} className="mb-1.5 flex items-baseline gap-1.5 text-sm font-semibold">Anything else?<span className="text-xs font-normal text-muted-foreground">Optional</span></label><textarea id={`${formId}-form-notes`} value={notes} onChange={event => setNotes(event.target.value)} maxLength={1500} rows={2} className="block w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-base outline-hidden focus-visible:ring-2 focus-visible:ring-ring" placeholder="Any other requirements" /></div>
          </div>
        </section>
      </fieldset>
      {error && <p role="alert" className="px-4 pb-4 text-sm text-destructive">{error}</p>}
      <div className="sticky bottom-0 z-10 flex flex-col-reverse items-center justify-between gap-2 border-t border-border bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:gap-3 sm:px-6"><span className="text-xs text-muted-foreground">Free request · No commission</span><Button type="submit" disabled={busy} className="h-12 w-full rounded-full px-5 sm:w-auto">{busy ? <Loader2 className="animate-spin" /> : <>Get Free Quotes<ArrowRight /></>}</Button></div>
    </form>;
  }
  return <form aria-label="Packaging requirement form" onChange={e => { const target = e.target; if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) { const fieldName = target.id.replace(`${formId}-form-`, ""); trackFormField(fieldName, Boolean(target.value.trim()), step); } }} onSubmit={e => { e.preventDefault(); if (step === 2) { const current = formBrief(family, values); setBrief(current); void submit(current); } else advance(); }} className="mt-3 scroll-mt-20 overflow-hidden rounded-2xl border border-border bg-card text-left shadow-lg shadow-primary/5">
    <div className="border-b border-border px-4 pb-4 pt-4 sm:px-7 sm:pb-5 sm:pt-5">
      {hasReference && <div className="mb-4 border-b border-border pb-4"><p className="text-base font-semibold text-primary">{remainingDetails.length ? `Just ${remainingDetails.length} details left` : "Your details are ready"}</p><p className="mt-1 text-sm text-muted-foreground">{remainingDetails.length ? remainingDetails.map(key => detailLabels[key]).join(" · ") : "Review your brief below."}</p><p className="mt-2 text-xs text-muted-foreground">Dimensions and extra specifications are optional.</p></div>}
      {!hasReference && <ol aria-label="Request progress" className="mb-4 grid grid-cols-3 gap-3 sm:mb-5 sm:gap-4">{STEPS.map((label, i) => <li key={label} aria-current={step === i ? "step" : undefined} className={`min-w-0 border-t-2 pt-2 ${i <= step ? "border-primary" : "border-border"}`}><span className={`flex items-center gap-1.5 text-xs font-semibold sm:text-sm ${step === i ? "text-primary" : i < step ? "text-foreground" : "text-muted-foreground"}`}><span className="shrink-0">{i < step ? <Check className="h-3.5 w-3.5" /> : `${i + 1}.`}</span>{label}</span></li>)}</ol>}
      <div className="flex items-center justify-between gap-2"><h2 ref={heading} tabIndex={-1} className="text-xl font-semibold outline-hidden sm:text-2xl">{[onlyFamily === "boxes" ? "Choose your box style" : "Choose your packaging", "Your WhatsApp number", "A few details & get quotes"][step]}</h2><span className="shrink-0 text-xs text-muted-foreground">{step + 1} / 3</span></div>
      {step > 0 && <p className="mt-1.5 text-sm text-muted-foreground">{family === "boxes" ? "Boxes" : "Pouches & sachets"}{values["format"] ? ` · ${values["format"]}` : ""}</p>}
    </div>
    <fieldset disabled={busy} className="space-y-5 px-4 py-4 sm:px-7 sm:py-6">
      {hasReference && <div className="border-b border-border pb-3"><div className="flex items-center gap-3"><img src={referenceDesigns[0]?.image} alt="Selected packaging reference" className="h-12 w-12 shrink-0 rounded-md object-cover" /><div className="min-w-0"><p className="break-words text-sm font-semibold">{referenceDesigns.map(d => d.name).join(", ")}</p><p className="mt-1 text-xs font-medium text-primary">Reference selected</p></div></div>{addedDetails.length > 0 && <dl className="mt-3 grid gap-2 sm:grid-cols-2">{addedDetails.map(key => <div key={key} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div><dt className="text-xs text-muted-foreground">{detailLabels[key]} · Already added</dt><dd className="font-medium">{values[key]}</dd></div></div>)}</dl>}</div>}
      {step === 0 && <>
        {!onlyFamily && <fieldset><legend className="mb-2 text-sm font-semibold">Packaging type</legend><div className="grid grid-cols-2 gap-3">{(["boxes", "pouches"] as const).map(f => <Button key={f} type="button" variant="outline" aria-pressed={family === f} className={`relative h-auto flex-col gap-0 overflow-hidden rounded-lg p-0 text-sm normal-case tracking-normal transition-all motion-safe:hover:-translate-y-0.5 hover:shadow-sm ${family === f ? "border-primary bg-accent ring-1 ring-primary hover:bg-accent" : "bg-background"}`} onClick={() => { if (f !== family) { setFamily(f); setValues({}); } onActive(); }}><img src={f === "boxes" ? boxesImage : pouchesImage} alt="" className="h-12 w-full object-contain p-1 mix-blend-multiply sm:h-20" /><span className="flex min-h-10 w-full items-center justify-between gap-1 px-2 py-2 text-[13px] sm:px-3 sm:text-sm"><span className="min-w-0 whitespace-normal text-left">{f === "boxes" ? "Boxes" : "Pouches & sachets"}</span><span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${family === f ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{family === f && <Check className="h-3 w-3" />}</span></span></Button>)}</div></fieldset>}
        <fieldset><legend className="mb-2 text-sm font-semibold">Packaging style</legend><div className="grid grid-cols-3 gap-2 sm:gap-3">{FORM_FORMATS[family].map(option => <Button key={option} type="button" variant="outline" aria-pressed={values["format"] === option} onClick={() => change("format", option)} className={`relative h-auto min-w-0 flex-col gap-1 whitespace-normal rounded-lg px-1.5 py-2 text-xs normal-case tracking-normal transition-all motion-safe:hover:-translate-y-0.5 hover:shadow-sm sm:px-3 sm:text-sm ${values["format"] === option ? "border-primary bg-accent text-primary ring-1 ring-primary hover:bg-accent" : "bg-background hover:border-primary/40"}`}>{STYLE_IMAGES[option] ? <img src={STYLE_IMAGES[option]} alt="" className="h-11 w-full object-contain mix-blend-multiply sm:h-16" /> : <div className="flex h-11 items-center sm:h-16"><HelpCircle className="h-7 w-7 text-muted-foreground" /></div>}<span className="flex min-h-8 items-center justify-center text-center leading-4">{option}</span>{values["format"] === option && <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="h-3 w-3" /></span>}</Button>)}</div></fieldset>
      </>}
      {step === 1 && <div className="space-y-3">
        <p className="text-sm leading-6 text-muted-foreground">Share your number so our team can help you find the right packaging manufacturer.</p>
        <div><label htmlFor={`${formId}-form-phone`} className="mb-1.5 block text-sm font-semibold">WhatsApp number</label><div className="flex h-12 items-center overflow-hidden rounded-lg border border-input bg-card focus-within:ring-2 focus-within:ring-ring"><span className="border-r border-border px-3 text-base text-muted-foreground">+91</span><Input id={`${formId}-form-phone`} className="h-12 rounded-none border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0" type="tel" autoComplete="tel-national" inputMode="numeric" maxLength={16} value={phone} onChange={e => { setPhone(e.target.value); setError(""); }} placeholder="98765 43210" autoFocus /></div><p className="mt-2 text-xs leading-5 text-muted-foreground">We only use it to share manufacturer options and your quotation. No spam.</p></div>
        <Button type="button" variant="ghost" className="h-11 w-full rounded-full text-sm normal-case tracking-normal text-muted-foreground" onClick={() => advance(true)}>Skip for now</Button>
      </div>}
      {step === 2 && <>
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          <div>{field("quantity", "Initial quantity (optional)", "e.g. 2,000 pieces")}{presets("quantity", ["500 pieces", "1,000 pieces", "5,000 pieces"])}</div>
          <div>{field("size", family === "boxes" ? "Box dimensions (optional)" : "Dimensions or fill (optional)", family === "boxes" ? "Length × width × height, e.g. 8 × 6 × 4 in" : "e.g. 250 g or width × height in cm")}{presets("size", SIZE_SUGGESTIONS[family])}{values["size"] === NOT_SURE_SIZE && <p className="mt-2 text-xs text-muted-foreground">No problem — our team will help you work out the size.</p>}</div>
        </div>
        {choices("printing", "Printing", ["Plain", "Logo only", "Multicolour", "Not sure"])}
        <details className="group border-t border-border pt-3"><summary className="flex min-h-11 cursor-pointer items-center justify-between text-sm font-semibold">More specifications <span className="text-xs font-normal text-primary group-open:hidden">Optional +</span></summary><div className="space-y-4 pt-3">{choices("material", "Material preference", family === "boxes" ? ["Kraft", "White-top", "Not sure"] : ["Mono-material", "Multilayer", "Paper-based", "Not sure"])}{family === "boxes" ? choices("wall", "Corrugated wall", ["3-ply", "5-ply", "7-ply", "Not sure"]) : choices("closure", "Closure", ["Heat seal", "Zipper", "Spout", "Not sure"])}{choices("finishing", "Finishing preference", ["Matte", "Gloss", "No preference"])}</div></details>
        <input ref={file} type="file" accept="image/*" multiple hidden onChange={async e => { const files = Array.from(e.target.files ?? []); setBusy(true); setError(""); try { const added = await Promise.all(files.slice(0, 4 - allImages.length).map(f => imageFileToDataUrl(f))); setPhotos(p => [...p, ...added]); } catch (e) { setError(e instanceof Error ? e.message : "Couldn’t add that photo."); } finally { setBusy(false); if (file.current) file.current.value = ""; } }} />
        <Button type="button" variant="outline" className="h-auto min-h-11 w-full justify-start gap-3 whitespace-normal rounded-lg border-dashed py-2 text-left bg-accent/30 px-4 text-sm hover:bg-accent/60" disabled={allImages.length >= 4} onClick={() => file.current?.click()}><ImagePlus /><span>{allImages.length ? "Add another photo" : "Add design / photos"}<span className="ml-1 text-xs font-normal text-muted-foreground">Optional</span></span></Button>
        {allImages.length > 0 && <div className="flex flex-wrap gap-2">{allImages.map((src, i) => <div key={i} className="relative"><img src={src} alt={`Design reference ${i + 1}`} className="h-14 w-14 rounded-lg border border-border object-cover" />{i >= referencePhotos.length && <Button type="button" variant="outline" size="icon" aria-label={`Remove photo ${i + 1}`} className="absolute -right-2 -top-2 h-6 w-6 rounded-full" onClick={() => setPhotos(p => p.filter((_, j) => j !== i - referencePhotos.length))}><X className="h-3 w-3" /></Button>}</div>)}</div>}
        <div className="grid gap-5 border-t border-border pt-4 sm:grid-cols-2 sm:gap-6">
          <div><label htmlFor={`${formId}-form-delivery`} className="mb-1.5 flex items-baseline gap-1.5 text-sm font-semibold">Delivery city<span className="text-xs font-normal text-muted-foreground">Optional</span></label><Input id={`${formId}-form-delivery`} className="h-11 rounded-lg bg-card text-base" value={values["delivery"] ?? ""} maxLength={240} placeholder="e.g. Pune, 411001" onChange={e => changeDelivery(e.target.value)} /></div>
          {indianMobile(phone) && earlySaved.current ? <div><p className="mb-1.5 text-sm font-semibold">WhatsApp number</p><p className="flex h-11 items-center justify-between rounded-lg border border-border bg-muted/40 px-3 text-base"><span>{indianMobile(phone)}</span><button type="button" className="text-sm text-primary underline-offset-2 hover:underline" onClick={() => setStep(1)}>Change</button></p></div> : <div><label htmlFor={`${formId}-form-phone`} className="mb-1.5 block text-sm font-semibold">WhatsApp number</label><Input id={`${formId}-form-phone`} className="h-11 rounded-lg bg-card text-base" type="tel" autoComplete="tel" inputMode="tel" maxLength={16} value={phone} onChange={e => { setPhone(e.target.value); setError(""); }} placeholder="98765 43210" /><p className="mt-1 text-xs text-muted-foreground">Needed to send your quotation.</p></div>}
        </div>
        <div><label htmlFor={`${formId}-form-notes`} className="mb-1.5 flex items-baseline gap-1.5 text-sm font-semibold">Anything else?<span className="text-xs font-normal text-muted-foreground">Optional</span></label><textarea id={`${formId}-form-notes`} value={notes} maxLength={1500} onChange={e => setNotes(e.target.value)} placeholder="e.g. Coffee, 250 g; matte finish" rows={2} className="block min-h-20 w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-base outline-hidden focus-visible:ring-2 focus-visible:ring-ring" /></div>
      </>}
    </fieldset>
    {error && <p role="alert" className="px-4 pb-4 text-sm text-destructive sm:px-6">{error}</p>}
    <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-4 py-4 sm:px-7">{step > 0 ? <Button type="button" variant="ghost" disabled={busy} className="h-12 rounded-full px-3" onClick={() => { setStep(s => s - 1); setError(""); }}><ArrowLeft />Back</Button> : <span aria-hidden="true" />}<Button type="submit" disabled={busy} className="h-12 min-w-44 rounded-full px-5 text-sm font-semibold sm:min-w-52">{busy ? <Loader2 className="animate-spin" /> : step === 2 ? "Get Free Quotes" : "Continue"}<ArrowRight /></Button></div>
  </form>;
}
