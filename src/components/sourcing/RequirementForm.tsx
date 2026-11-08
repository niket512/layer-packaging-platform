import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Loader2, X, MapPin, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SourcingBrief } from "./SourcingBrief";
import { FORM_FORMATS, designFormPrefill, formBrief, formSubmission, type FormFamily } from "@/lib/sourcing-form";
import type { PackagingDesign } from "./packaging-catalogue";
import { validSourcingPhone } from "@/lib/sourcing";
import { imageFileToDataUrl } from "@/lib/image-data-url";
import { supabase } from "@/integrations/supabase/client";
import { syncSourcingChat } from "@/lib/chat-monitoring";
import { flushVisitorTracking, trackFunnel } from "@/lib/visitor-tracking";
import type { SourcingBriefField } from "../../../supabase/functions/_shared/sourcing-intake";
import boxesImage from "@/assets/design-ship-kraft.jpg";
import pouchesImage from "@/assets/category-stand-up-pouches.jpg";
import mailerImage from "@/assets/design-mailer-white.jpg";
import printedImage from "@/assets/design-printed-kraft.jpg";
import diecutImage from "@/assets/design-diecut-open.jpg";
import flatImage from "@/assets/category-flat-pouches.jpg";
import flatbottomImage from "@/assets/reference-flatbottom-pouch.jpg";
import spoutImage from "@/assets/reference-spout-pouch.jpg";

const STYLE_IMAGES: Record<string, string> = {
  "Shipping box": boxesImage, "Mailer box": mailerImage, "Product box": printedImage,
  "Die-cut box": diecutImage, "Gift box": mailerImage,
  "Stand-up pouch": pouchesImage, "Flat pouch": flatImage, "Flat-bottom pouch": flatbottomImage,
  "Spout pouch": spoutImage, "Sachet / stick pack": flatImage,
};
const STEPS = ["Packaging", "Scale", "Specs", "Contact"];


export function RequirementForm({ reference, referencePhotos, referenceDesigns, onActive }: { reference: string; referencePhotos: string[]; referenceDesigns: PackagingDesign[]; onActive: () => void }) {
  const navigate = useNavigate();
  const [family, setFamily] = useState<FormFamily>("boxes");
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [brief, setBrief] = useState<SourcingBriefField[]>([]);
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const id = useRef(crypto.randomUUID());
  const savedId = useRef(crypto.randomUUID());
  useEffect(() => {
    const prefill = designFormPrefill(referenceDesigns);
    if (!prefill) return;
    setFamily(prefill.family);
    setValues(previous => ({ ...prefill.values, ...Object.fromEntries(Object.entries(previous).filter(([, value]) => value.trim())) }));
    setStep(0);
    setError("");
  }, [referenceDesigns]);
  const change = (topic: string, value: string) => { onActive(); setValues(v => ({ ...v, [topic]: value })); };
  const choices = (topic: string, label: string, options: string[]) => <fieldset className="min-w-0"><legend className="mb-1.5 text-sm font-semibold">{label}</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{options.map(option => <Button key={option} type="button" size="sm" variant="outline" aria-pressed={values[topic] === option} onClick={() => change(topic, option)} className={`h-auto min-h-11 justify-between whitespace-normal rounded-lg px-2.5 py-1.5 text-left text-sm normal-case tracking-normal transition-colors sm:min-h-11 sm:px-3 sm:py-1.5 sm:text-sm ${values[topic] === option ? "border-primary bg-accent text-primary ring-1 ring-primary hover:bg-accent" : "bg-background hover:border-primary/40"}`}><span>{option}</span><span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${values[topic] === option ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{values[topic] === option && <Check className="h-3 w-3" />}</span></Button>)}</div></fieldset>;
  const field = (topic: string, label: string, placeholder: string) => <div className="min-w-0"><label htmlFor={`form-${topic}`} className="mb-1.5 flex flex-wrap items-baseline gap-1.5 text-sm font-semibold">{label.replace(" (optional)", "")}{label.includes("(optional)") && <span className="text-xs font-normal text-muted-foreground">Optional</span>}</label><Input id={`form-${topic}`} className="h-11 rounded-lg bg-card text-base" value={values[topic] ?? ""} maxLength={240} placeholder={placeholder} onChange={e => change(topic, e.target.value)} /></div>;
  const sectionTitle = (title: string, Icon: typeof MapPin) => <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold sm:mb-3"><Icon className="h-4 w-4 text-primary" />{title}</h3>;
  const allImages = [...referencePhotos, ...photos].slice(0, 4);
  const changeDelivery = (value: string) => {
    change("delivery", value);
    setBrief(b => {
      const rest = b.filter(f => f.topic !== "delivery");
      return value.trim() ? [...rest, { topic: "delivery", value: value.trim(), source: "buyer" as const }] : rest;
    });
  };
  const advance = () => {
    if (step === 0 && !values.format) { setError("Choose a packaging style, or select Not sure."); return; }
    setError(""); onActive();
    if (step === 2) { setBrief(formBrief(family, values)); trackFunnel("brief_shown"); trackFunnel("contact_shown"); }
    setStep(s => Math.min(3, s + 1));
  };
  const submit = async () => {
    if (busy) return;
    if (!validSourcingPhone(phone)) { setError("Please enter a valid contact number, including the country code if outside India."); return; }
    const details = [notes, reference].filter(Boolean).join("\n\n");
    const payload = formSubmission(brief, phone, details, allImages);
    if (!payload) return;
    setBusy(true); setError(""); trackFunnel("contact_submitted");
    try {
      const { error: insertError } = await supabase.from("requirement_submissions").insert({ ...payload, id: savedId.current });
      if (insertError) throw new Error("Your request couldn’t be sent. Please try again.");
      trackFunnel("request_saved"); window.__lovableEvents?.track?.("project.sourcing_request_submitted", { channel: "form" }); void flushVisitorTracking();
      await syncSourcingChat({ id: id.current, title: "Guided packaging request", brief, submitted: true, submissionId: savedId.current, phone, turns: [{ query: payload.requirement, matches: [], images: allImages }] }).catch(() => {});
      try { localStorage.setItem("snaplogo.sourcing.thankyou", JSON.stringify({ leadId: id.current, phone, brief })); } catch { /* Saved enquiry remains available. */ }
      navigate("/sourcing/thank-you");
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); }
    finally { setBusy(false); }
  };
  const presets = (topic: string, options: string[]) => <div className="mt-2 flex flex-wrap gap-2" aria-label={topic === "quantity" ? "Suggested quantities" : "Example dimensions"}>{options.map(value => <Button key={value} type="button" variant="outline" size="sm" aria-pressed={values[topic] === value} onClick={() => change(topic, value)} className={`h-11 rounded-full px-3 text-xs normal-case tracking-normal ${values[topic] === value ? "border-primary bg-accent text-primary" : "bg-card text-muted-foreground"}`}>{value}</Button>)}</div>;
  return <form aria-label="Packaging requirement form" onSubmit={e => { e.preventDefault(); if (step === 3) void submit(); else advance(); }} className="mt-2 scroll-mt-20 overflow-hidden rounded-2xl border border-primary/30 bg-card text-left shadow-lg shadow-primary/5">
    <div className="border-b border-border bg-accent/40 px-4 py-3 sm:px-6 sm:py-4">
      <ol aria-label="Request progress" className="mb-3 grid grid-cols-4 gap-1.5 sm:gap-2">{STEPS.map((label, i) => <li key={label} aria-current={step === i ? "step" : undefined} className={`flex min-h-10 min-w-0 items-center justify-center gap-1 rounded-full px-1 text-[11px] font-semibold sm:text-sm ${step === i ? "bg-primary text-primary-foreground shadow-sm" : i < step ? "bg-accent text-primary" : "bg-muted text-muted-foreground"}`}><span className="shrink-0">{i < step ? <Check className="h-3.5 w-3.5" /> : `${i + 1}.`}</span><span>{label}</span></li>)}</ol>
      <div className="flex items-center justify-between gap-2"><h2 className="text-lg font-semibold sm:text-xl">{["Choose your packaging", "How much & what size?", "Make it your own", "Review & get quotes"][step]}</h2><span className="shrink-0 text-xs text-muted-foreground">{step + 1} / 4</span></div>
    </div>
    <fieldset disabled={busy} className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
      {referenceDesigns.length > 0 && <div className="flex items-center gap-3 border-b border-border pb-3"><img src={referenceDesigns[0]?.image} alt="Selected packaging reference" className="h-12 w-12 shrink-0 rounded-md object-cover" /><div className="min-w-0"><p className="break-words text-sm font-semibold">{referenceDesigns.map(d => d.name).join(", ")}</p><p className="text-xs text-muted-foreground">Design details added · You can edit your choices</p></div></div>}
      {step === 0 && <>
        <fieldset><legend className="mb-2 text-sm font-semibold">Packaging type</legend><div className="grid grid-cols-2 gap-3">{(["boxes", "pouches"] as const).map(f => <Button key={f} type="button" variant="outline" aria-pressed={family === f} className={`relative h-auto flex-col gap-0 overflow-hidden rounded-lg p-0 text-sm normal-case tracking-normal transition-all motion-safe:hover:-translate-y-0.5 hover:shadow-sm ${family === f ? "border-primary bg-accent ring-1 ring-primary hover:bg-accent" : "bg-background"}`} onClick={() => { if (f !== family) { setFamily(f); setValues({}); } onActive(); }}><img src={f === "boxes" ? boxesImage : pouchesImage} alt="" className="h-14 w-full object-contain p-2 sm:h-20" /><span className="flex min-h-10 w-full items-center justify-between gap-1 px-3 py-2 text-sm"><span>{f === "boxes" ? "Boxes" : "Pouches & sachets"}</span><span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${family === f ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{family === f && <Check className="h-3 w-3" />}</span></span></Button>)}</div></fieldset>
        <fieldset><legend className="mb-2 text-sm font-semibold">Packaging style</legend><div className="grid grid-cols-3 gap-2 sm:gap-3">{FORM_FORMATS[family].map(option => <Button key={option} type="button" variant="outline" aria-pressed={values.format === option} onClick={() => change("format", option)} className={`relative h-auto min-w-0 flex-col gap-1 whitespace-normal rounded-lg px-1.5 py-2 text-xs normal-case tracking-normal transition-all motion-safe:hover:-translate-y-0.5 hover:shadow-sm sm:px-3 sm:text-sm ${values.format === option ? "border-primary bg-accent text-primary ring-1 ring-primary hover:bg-accent" : "bg-background hover:border-primary/40"}`}>{STYLE_IMAGES[option] ? <img src={STYLE_IMAGES[option]} alt="" className="h-11 w-full object-contain sm:h-16" /> : <div className="flex h-11 items-center sm:h-16"><HelpCircle className="h-7 w-7 text-muted-foreground" /></div>}<span className="flex min-h-8 items-center justify-center text-center leading-4">{option}</span>{values.format === option && <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="h-3 w-3" /></span>}</Button>)}</div></fieldset>
      </>}
      {step === 1 && <>
        <div>{field("quantity", "Initial quantity", "e.g. 2,000 pieces")}{presets("quantity", ["500 pieces", "1,000 pieces", "5,000 pieces"])}</div>
        <div>{field("size", family === "boxes" ? "Box dimensions (optional)" : "Dimensions or fill (optional)", family === "boxes" ? "Length × width × height, e.g. 20 × 15 × 10 cm" : "e.g. 250 g or width × height in cm")}{presets("size", family === "boxes" ? ["15 × 10 × 5 cm", "20 × 15 × 10 cm"] : ["100 g", "250 g", "500 g"])}<p className="mt-2 text-xs text-muted-foreground">{family === "boxes" ? "Dimensions in cm · Example sizes, editable" : "Fill weight or dimensions · Examples, editable"}</p></div>
      </>}
      {step === 2 && <>
        {choices("printing", "Printing", ["Plain", "Logo only", "Multicolour", "Not sure"])}
        {choices("material", "Material preference", family === "boxes" ? ["Kraft", "White-top", "Not sure"] : ["Mono-material", "Multilayer", "Paper-based", "Not sure"])}
        <details className="group border-t border-border pt-3"><summary className="flex min-h-11 cursor-pointer items-center justify-between text-sm font-semibold">More specifications <span className="text-xs font-normal text-primary group-open:hidden">Optional +</span></summary><div className="space-y-4 pt-3">{family === "boxes" ? choices("wall", "Corrugated wall", ["3-ply", "5-ply", "7-ply", "Not sure"]) : choices("closure", "Closure", ["Heat seal", "Zipper", "Spout", "Not sure"])}{choices("finishing", "Finishing preference", ["Matte", "Gloss", "No preference"])}</div></details>
        <input ref={file} type="file" accept="image/*" multiple hidden onChange={async e => { const files = Array.from(e.target.files ?? []); setBusy(true); setError(""); try { const added = await Promise.all(files.slice(0, 4 - allImages.length).map(f => imageFileToDataUrl(f))); setPhotos(p => [...p, ...added]); } catch (e) { setError(e instanceof Error ? e.message : "Couldn’t add that photo."); } finally { setBusy(false); if (file.current) file.current.value = ""; } }} />
        <Button type="button" variant="outline" className="h-11 w-full justify-start gap-3 rounded-lg border-dashed bg-accent/30 px-4 text-sm hover:bg-accent/60" disabled={allImages.length >= 4} onClick={() => file.current?.click()}><ImagePlus /><span>{allImages.length ? "Add another photo" : "Add design / photos"}<span className="ml-1 text-xs font-normal text-muted-foreground">Optional</span></span></Button>
        {allImages.length > 0 && <div className="flex flex-wrap gap-2">{allImages.map((src, i) => <div key={i} className="relative"><img src={src} alt={`Design reference ${i + 1}`} className="h-14 w-14 rounded-lg border border-border object-cover" />{i >= referencePhotos.length && <Button type="button" variant="outline" size="icon" aria-label={`Remove photo ${i + 1}`} className="absolute -right-2 -top-2 h-6 w-6 rounded-full" onClick={() => setPhotos(p => p.filter((_, j) => j !== i - referencePhotos.length))}><X className="h-3 w-3" /></Button>}</div>)}</div>}
      </>}
      {step === 3 && <>
        <div className="[&_section]:my-0 [&_section]:border-t-0 [&_section]:py-1 [&_dt]:text-xs [&_dt]:normal-case [&_dt]:tracking-normal [&_dd>span]:text-sm"><SourcingBrief fields={brief} disabled={busy} onSave={setBrief} /></div>
        <div className="space-y-3 border-t border-border pt-3">{sectionTitle("Contact for quote updates", MapPin)}
          <div><label htmlFor="form-delivery" className="mb-1.5 block text-sm font-semibold">Delivery city</label><Input id="form-delivery" className="h-11 rounded-lg bg-card text-base" value={values.delivery ?? ""} maxLength={240} placeholder="e.g. Pune, 411001" onChange={e => changeDelivery(e.target.value)} /></div>
          <div><label htmlFor="form-notes" className="mb-1.5 flex items-baseline gap-1.5 text-sm font-semibold">Anything else?<span className="text-xs font-normal text-muted-foreground">Optional</span></label><textarea id="form-notes" value={notes} maxLength={1500} onChange={e => setNotes(e.target.value)} placeholder="e.g. Coffee, 250 g; matte finish" rows={1} className="w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
          <div><label htmlFor="form-phone" className="mb-1.5 block text-sm font-semibold">WhatsApp number</label><Input id="form-phone" className="h-12 rounded-lg border-primary/40 bg-card text-base" type="tel" autoComplete="tel" inputMode="tel" maxLength={25} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" required /><p className="mt-2 text-xs leading-5 text-muted-foreground">We’ll share quotes from multiple manufacturers within 4 hours. No instant price estimate.</p></div>
        </div>
      </>}
    </fieldset>
    {error && <p role="alert" className="px-4 pb-4 text-sm text-destructive sm:px-6">{error}</p>}
    <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-4 py-3 sm:px-6">{step > 0 ? <Button type="button" variant="ghost" disabled={busy} onClick={() => { setStep(s => s - 1); setError(""); }}><ArrowLeft />Back</Button> : <span className="text-xs text-muted-foreground">Free · No commission</span>}<Button type="submit" disabled={busy} className="h-12 min-w-36 rounded-full px-5 font-semibold shadow-md shadow-primary/15">{busy ? <Loader2 className="animate-spin" /> : step === 3 ? "Get Free Quotes" : step === 2 ? "Review brief" : "Continue"}<ArrowRight /></Button></div>
  </form>;
}
