import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Loader2, X, ShieldCheck, Package, MapPin, Palette } from "lucide-react";
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
  const choices = (topic: string, label: string, options: string[]) => <fieldset className="min-w-0"><legend className="mb-2 text-sm font-semibold">{label}</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{options.map(option => <Button key={option} type="button" size="sm" variant="outline" aria-pressed={values[topic] === option} onClick={() => change(topic, option)} className={`h-auto min-h-11 justify-between whitespace-normal rounded-lg px-3 py-2 text-left text-xs normal-case tracking-normal transition-colors ${values[topic] === option ? "border-primary bg-accent text-primary ring-1 ring-primary hover:bg-accent" : "bg-background hover:border-primary/40"}`}><span>{option}</span><span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${values[topic] === option ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{values[topic] === option && <Check className="h-3 w-3" />}</span></Button>)}</div></fieldset>;
  const field = (topic: string, label: string, placeholder: string) => <div className="min-w-0"><label htmlFor={`form-${topic}`} className="mb-2 flex flex-wrap items-baseline gap-1.5 text-sm font-semibold">{label.replace(" (optional)", "")}{label.includes("(optional)") && <span className="text-xs font-normal text-muted-foreground">Optional</span>}</label><Input id={`form-${topic}`} className="h-11 rounded-lg bg-card" value={values[topic] ?? ""} maxLength={240} placeholder={placeholder} onChange={e => change(topic, e.target.value)} /></div>;
  const sectionTitle = (title: string, Icon: typeof Package) => <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-primary" />{title}</h3>;
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
    if (step === 1) { setBrief(formBrief(family, values)); trackFunnel("brief_shown"); trackFunnel("contact_shown"); }
    setStep(s => Math.min(2, s + 1));
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
      trackFunnel("request_saved"); void flushVisitorTracking();
      await syncSourcingChat({ id: id.current, title: "Guided packaging request", brief, submitted: true, submissionId: savedId.current, phone, turns: [{ query: payload.requirement, matches: [], images: allImages }] }).catch(() => {});
      try { localStorage.setItem("snaplogo.sourcing.thankyou", JSON.stringify({ leadId: id.current, phone, brief })); } catch { /* Saved enquiry remains available. */ }
      navigate("/sourcing/thank-you");
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); }
    finally { setBusy(false); }
  };
  return <form aria-label="Packaging requirement form" onSubmit={e => { e.preventDefault(); if (step === 2) void submit(); else advance(); }} className="mt-3 overflow-hidden rounded-2xl border border-primary/30 bg-card text-left shadow-lg shadow-primary/5">
    <div className="border-b border-border bg-accent/50 px-4 py-4 sm:px-6"><ol aria-label="Request progress" className="mb-4 grid grid-cols-3 gap-3">{["Packaging", "Details", "Get quotes"].map((label, i) => <li key={label} aria-current={step === i ? "step" : undefined}><div className={`mb-2 h-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} /><span className={`flex items-center gap-1.5 text-[11px] font-semibold sm:text-xs ${step === i ? "text-primary" : "text-muted-foreground"}`}>{i < step ? <Check className="h-3 w-3" /> : <span>{i + 1}.</span>}{label}</span></li>)}</ol><div className="flex items-center justify-between gap-2"><h2 className="text-lg font-semibold">{["Choose your packaging", "Add packaging details", "Review & get quotes"][step]}</h2><span className="shrink-0 text-xs text-muted-foreground">{step + 1} / 3</span></div></div>
    <fieldset disabled={busy} className="space-y-5 px-4 py-5 sm:px-6">
      {referenceDesigns.length > 0 && <div className="flex items-center gap-3 rounded-lg border border-border bg-accent/30 p-3"><img src={referenceDesigns[0]?.image} alt="Selected packaging reference" className="h-14 w-14 shrink-0 rounded-md object-cover" /><div className="min-w-0"><p className="break-words text-sm font-semibold">{referenceDesigns.map(d => d.name).join(", ")}</p><p className="text-xs text-muted-foreground">Design details added · You can edit your choices</p></div></div>}
      {step === 0 && <><fieldset><legend className="mb-2 text-sm font-semibold">Packaging type</legend><div className="grid grid-cols-2 gap-3">{(["boxes", "pouches"] as const).map(f => <Button key={f} type="button" variant="outline" aria-pressed={family === f} className={`relative h-auto flex-col gap-0 overflow-hidden rounded-lg p-0 text-sm normal-case tracking-normal ${family === f ? "border-primary bg-accent ring-1 ring-primary hover:bg-accent" : "bg-background"}`} onClick={() => { setFamily(f); setValues({}); onActive(); }}><img src={f === "boxes" ? boxesImage : pouchesImage} alt="" className="h-20 w-full bg-background object-contain p-2 sm:h-24" /><span className="flex min-h-10 w-full items-center justify-between gap-1 px-3 py-2 text-xs sm:text-sm">{f === "boxes" ? "Boxes" : "Pouches & sachets"}<span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${family === f ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{family === f && <Check className="h-3 w-3" />}</span></span></Button>)}</div></fieldset>{choices("format", "Packaging style", FORM_FORMATS[family])}{field("quantity", "Initial quantity", "e.g. 2,000 pieces")}</>}
      {step === 1 && <><div>{sectionTitle("What are you packing?", Package)}<div className="grid gap-4 sm:grid-cols-2">{field("size", family === "boxes" ? "Box dimensions (optional)" : "Dimensions or fill (optional)", family === "boxes" ? "e.g. 20 × 15 × 10 cm" : "e.g. 250 g or 15 × 22 cm")}</div></div><div className="border-t border-border pt-5">{sectionTitle("Look & construction", Palette)}<div className="space-y-4">{choices("printing", "Printing", ["Plain", "Logo only", "Multicolour", "Not sure"])}{family === "boxes" ? choices("wall", "Corrugated wall", ["3-ply", "5-ply", "7-ply", "Not sure"]) : choices("closure", "Closure", ["Heat seal", "Zipper", "Spout", "Not sure"])}</div></div><input ref={file} type="file" accept="image/*" multiple hidden onChange={async e => { const files = Array.from(e.target.files ?? []); setBusy(true); setError(""); try { const added = await Promise.all(files.slice(0, 4 - allImages.length).map(f => imageFileToDataUrl(f))); setPhotos(p => [...p, ...added]); } catch (e) { setError(e instanceof Error ? e.message : "Couldn’t add that photo."); } finally { setBusy(false); if (file.current) file.current.value = ""; } }} /><Button type="button" variant="outline" className="h-16 w-full justify-start gap-3 rounded-lg border-dashed bg-accent/30 px-4 text-sm hover:bg-accent/60" disabled={allImages.length >= 4} onClick={() => file.current?.click()}><ImagePlus /><span className="min-w-0">{allImages.length ? "Add another photo" : "Add design / photos"}<span className="ml-1 text-xs font-normal text-muted-foreground">Optional</span></span></Button>{reference && <p className="text-xs text-muted-foreground">Selected design references added to your request.</p>}{allImages.length > 0 && <div className="flex flex-wrap gap-2">{allImages.map((src, i) => <div key={i} className="relative"><img src={src} alt={`Design reference ${i + 1}`} className="h-16 w-16 rounded-lg border border-border object-cover" />{i >= referencePhotos.length && <Button type="button" variant="outline" size="icon" aria-label={`Remove photo ${i + 1}`} className="absolute -right-2 -top-2 h-6 w-6 rounded-full" onClick={() => setPhotos(p => p.filter((_, j) => j !== i - referencePhotos.length))}><X className="h-3 w-3" /></Button>}</div>)}</div>}</>}
      {step === 2 && <><div className="[&_section]:my-0 [&_section]:border-t-0 [&_section]:pt-0"><SourcingBrief fields={brief} disabled={busy} onSave={setBrief} /></div>{allImages.length > 0 && <div className="flex flex-wrap gap-2">{allImages.map((src, i) => <img key={i} src={src} alt={`Attached design ${i + 1}`} className="h-16 w-16 rounded-lg border border-border object-cover" />)}</div>}<p className="text-sm leading-relaxed text-muted-foreground">We’ll take your requirements to our manufacturer network and share quotations from multiple manufacturers within 4 hours.</p><div className="space-y-4 border-t border-border pt-5">{sectionTitle("Contact for quote updates", MapPin)}<div><label htmlFor="form-delivery" className="mb-2 block text-sm font-semibold">Delivery city</label><Input id="form-delivery" className="h-11 rounded-lg bg-card" value={values.delivery ?? ""} maxLength={240} placeholder="e.g. Pune, 411001" onChange={e => changeDelivery(e.target.value)} /></div><div><label htmlFor="form-phone" className="mb-2 block text-sm font-semibold">Phone number</label><Input id="form-phone" className="h-12 rounded-lg border-primary/30 bg-card text-base" type="tel" autoComplete="tel" inputMode="tel" maxLength={25} value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +91 98765 43210" required /><p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 shrink-0" />For your packaging request and quote updates.</p></div><div><label htmlFor="form-notes" className="mb-2 flex flex-wrap items-baseline gap-1.5 text-sm font-semibold">Anything else?<span className="text-xs font-normal text-muted-foreground">Optional</span></label><textarea id="form-notes" value={notes} maxLength={1500} onChange={e => setNotes(e.target.value)} placeholder="e.g. Coffee, 250 g; matte finish, window, custom inserts…" rows={2} className="w-full resize-y rounded-lg border border-input bg-card px-3 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div></div></>}
    </fieldset>
    {error && <p role="alert" className="px-4 pb-4 text-sm text-destructive sm:px-6">{error}</p>}
    <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-4 py-4 sm:px-6">{step > 0 ? <Button type="button" variant="ghost" disabled={busy} onClick={() => { setStep(s => s - 1); setError(""); }}><ArrowLeft />Back</Button> : <span className="text-xs text-muted-foreground">Free · No commission</span>}<Button type="submit" disabled={busy} className="h-12 min-w-36 rounded-full px-5 font-semibold shadow-md shadow-primary/15">{busy ? <Loader2 className="animate-spin" /> : step === 2 ? "Get Free Quotes" : step === 1 ? "Review brief" : "Continue"}<ArrowRight /></Button></div>
  </form>;
}