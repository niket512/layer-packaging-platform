import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SourcingBrief } from "./SourcingBrief";
import { FORM_FORMATS, formBrief, formSubmission, type FormFamily } from "@/lib/sourcing-form";
import { validSourcingPhone } from "@/lib/sourcing";
import { imageFileToDataUrl } from "@/lib/image-data-url";
import { supabase } from "@/integrations/supabase/client";
import { syncSourcingChat } from "@/lib/chat-monitoring";
import { flushVisitorTracking, trackFunnel } from "@/lib/visitor-tracking";
import type { SourcingBriefField } from "../../../supabase/functions/_shared/sourcing-intake";

export function RequirementForm({ reference, referencePhotos, onActive }: { reference: string; referencePhotos: string[]; onActive: () => void }) {
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
  const change = (topic: string, value: string) => { onActive(); setValues(v => ({ ...v, [topic]: value })); };
  const choices = (topic: string, label: string, options: string[]) => <fieldset className="min-w-0"><legend className="mb-2 text-sm font-semibold">{label}</legend><div className="flex flex-wrap gap-2">{options.map(option => <Button key={option} type="button" size="sm" variant={values[topic] === option ? "default" : "outline"} aria-pressed={values[topic] === option} onClick={() => change(topic, option)} className="h-auto min-h-9 whitespace-normal rounded-lg px-3 py-2 text-xs normal-case tracking-normal">{option}{values[topic] === option && <Check className="h-3 w-3" />}</Button>)}</div></fieldset>;
  const field = (topic: string, label: string, placeholder: string) => <div className="min-w-0"><label htmlFor={`form-${topic}`} className="mb-2 block text-sm font-semibold">{label}</label><Input id={`form-${topic}`} value={values[topic] ?? ""} maxLength={240} placeholder={placeholder} onChange={e => change(topic, e.target.value)} /></div>;
  const allImages = [...referencePhotos, ...photos].slice(0, 4);
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
  return <form aria-label="Packaging requirement form" onSubmit={e => { e.preventDefault(); if (step === 2) void submit(); else advance(); }} className="mt-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm sm:p-6">
    <div className="mb-5 flex items-center justify-between gap-2 border-b border-border pb-3"><h2 className="text-base font-semibold">{["Choose your packaging", "Add packaging details", "Review & get quotes"][step]}</h2><span className="shrink-0 text-xs text-muted-foreground">{step + 1} / 3</span></div>
    <fieldset disabled={busy} className="space-y-5">
      {step === 0 && <><fieldset><legend className="mb-2 text-sm font-semibold">Packaging type</legend><div className="grid grid-cols-2 gap-2">{(["boxes", "pouches"] as const).map(f => <Button key={f} type="button" variant={family === f ? "default" : "outline"} aria-pressed={family === f} className="h-11 rounded-lg text-sm normal-case tracking-normal" onClick={() => { setFamily(f); setValues({}); onActive(); }}>{f === "boxes" ? "Boxes" : "Pouches & sachets"}</Button>)}</div></fieldset>{choices("format", "Packaging style", FORM_FORMATS[family])}{choices("quantity", "Initial quantity", ["100–500 pieces", "500–1,000 pieces", "1,000–5,000 pieces", "5,000+ pieces", "Not sure"])}{field("quantity", "Exact quantity (optional)", "e.g. 2,000 pieces per month")}</>}
      {step === 1 && <><div className="grid gap-5 sm:grid-cols-2">{field("product", "Product to pack", "e.g. Coffee, skincare, snacks")}{field("size", family === "boxes" ? "Box dimensions (optional)" : "Dimensions or fill (optional)", family === "boxes" ? "e.g. 20 × 15 × 10 cm" : "e.g. 250 g or 15 × 22 cm")}</div>{choices("printing", "Printing", ["Plain", "Logo only", "Multicolour", "Not sure"])}{family === "boxes" ? choices("wall", "Corrugated wall", ["3-ply", "5-ply", "7-ply", "Not sure"]) : choices("closure", "Closure", ["Heat seal", "Zipper", "Spout", "Not sure"])}<div className="grid gap-5 sm:grid-cols-2">{field("delivery", "Delivery city (optional)", "e.g. Pune, 411001")}{field("budget", "Target price (optional)", "e.g. ₹8–12 per piece")}</div>{field("material", "Material preference (optional)", "e.g. Kraft board, high-barrier laminate")}<div><label htmlFor="form-notes" className="mb-2 block text-sm font-semibold">Anything else? (optional)</label><textarea id="form-notes" value={notes} maxLength={1500} onChange={e => setNotes(e.target.value)} placeholder="e.g. Matte finish, window, custom inserts…" rows={2} className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div><input ref={file} type="file" accept="image/*" multiple hidden onChange={async e => { const files = Array.from(e.target.files ?? []); setBusy(true); setError(""); try { const added = await Promise.all(files.slice(0, 4 - allImages.length).map(f => imageFileToDataUrl(f))); setPhotos(p => [...p, ...added]); } catch (e) { setError(e instanceof Error ? e.message : "Couldn’t add that photo."); } finally { setBusy(false); if (file.current) file.current.value = ""; } }} /><Button type="button" variant="outline" className="rounded-full" disabled={allImages.length >= 4} onClick={() => file.current?.click()}><ImagePlus />Add design / photos (optional)</Button>{reference && <p className="text-xs text-muted-foreground">Selected design references added to your request.</p>}{allImages.length > 0 && <div className="flex flex-wrap gap-2">{allImages.map((src, i) => <div key={i} className="relative"><img src={src} alt={`Design reference ${i + 1}`} className="h-16 w-16 rounded-lg border border-border object-cover" />{i >= referencePhotos.length && <Button type="button" variant="outline" size="icon" aria-label={`Remove photo ${i + 1}`} className="absolute -right-2 -top-2 h-6 w-6 rounded-full" onClick={() => setPhotos(p => p.filter((_, j) => j !== i - referencePhotos.length))}><X className="h-3 w-3" /></Button>}</div>)}</div>}</>}
      {step === 2 && <><SourcingBrief fields={brief} disabled={busy} onSave={setBrief} /><p className="text-sm leading-relaxed text-muted-foreground">We’ll take your requirements to our manufacturer network and share quotations from multiple manufacturers within 4 hours.</p><div><label htmlFor="form-phone" className="mb-2 block text-sm font-semibold">Phone number for quote updates</label><Input id="form-phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={25} value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +91 98765 43210" required /></div></>}
    </fieldset>
    {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
    <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">{step > 0 ? <Button type="button" variant="ghost" disabled={busy} onClick={() => { setStep(s => s - 1); setError(""); }}><ArrowLeft />Back</Button> : <span className="text-xs text-muted-foreground">Free · No commission</span>}<Button type="submit" disabled={busy} className="h-11 rounded-full px-5">{busy ? <Loader2 className="animate-spin" /> : step === 2 ? "Get Free Quotes" : step === 1 ? "Review brief" : "Continue"}<ArrowRight /></Button></div>
  </form>;
}