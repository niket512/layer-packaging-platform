import { useEffect, useRef, useState } from "react";
import { useHydrated } from "@tanstack/react-router";
import { useNavigate } from "@/lib/router-compat";
import { ArrowLeft, ArrowRight, Check, HelpCircle, Loader2, X, ImagePlus, Box, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { imageFileToDataUrl } from "@/lib/image-data-url";
import { BOX_STYLE_IMAGES } from "./box-style-images";
import { supabase } from "@/integrations/supabase/client";
import { readAttribution } from "@/lib/attribution";
import { markConversionPending } from "@/lib/sourcing-conversion";
import { syncSourcingChat } from "@/lib/chat-monitoring";
import { flushVisitorTracking, trackFormField, trackFunnel, trackJourney } from "@/lib/visitor-tracking";
import { indianMobile, formSubmission } from "@/lib/sourcing-form";
import { BOX_TYPES, emptyEnquiry, enquiryBrief, enquiryDetails, enquiryText, pruneForTypes, singleChoiceEnquiry, stepFieldError, type BoxEnquiry } from "@/lib/box-enquiry";

const STEPS = ["Box type", "Details & contact"];
const STEP_ICONS = [Box, Pencil];
const KEY = "snaplogo.form.v2.draft";

export function PremiumBoxForm({ onActive }: { onActive: () => void }) {
  const navigate = useNavigate();
  // The saved draft lives in this browser only, so it is restored after the server-rendered form hydrates.
  const hydrated = useHydrated();
  const hydratedAtMount = useRef(hydrated).current;
  const saved = useRef<{ step?: number; e?: BoxEnquiry; id?: string } | null>(null);
  const readDraft = (): { step?: number; e?: BoxEnquiry; id?: string } => { try { saved.current = JSON.parse(localStorage.getItem(KEY) ?? "{}") ?? {}; } catch { saved.current = {}; } return saved.current ?? {}; };
  if (saved.current === null && hydratedAtMount) readDraft();
  const [step, setStep] = useState(() => Math.min(1, Math.max(0, saved.current?.step ?? 0)));
  const [e, setE] = useState<BoxEnquiry>(() => singleChoiceEnquiry({ ...emptyEnquiry(), ...saved.current?.e }));
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const id = useRef(saved.current?.id ?? crypto.randomUUID());
  const savedId = useRef(crypto.randomUUID());
  const earlySaved = useRef("");
  const heading = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (!hydrated || saved.current !== null) return;
    const draft = readDraft();
    if (draft.id) id.current = draft.id;
    if (draft.e) setE(singleChoiceEnquiry({ ...emptyEnquiry(), ...draft.e }));
    const restoredStep = Math.min(1, Math.max(0, draft.step ?? 0));
    if (restoredStep) { first.current = true; setStep(restoredStep); }
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (saved.current === null) return; try { localStorage.setItem(KEY, JSON.stringify({ step, e, id: id.current })); } catch { /* memory only */ } }, [step, e]);
  useEffect(() => {
    trackJourney({ kind: "form_step", step: String(step + 1), category: "form-v2-2step" });
    if (step === 1) trackFunnel("contact_shown");
    if (first.current) { first.current = false; return; }
    heading.current?.focus({ preventScroll: true });
    const form = heading.current?.closest("form");
    if (form && form.getBoundingClientRect().top < 64) form.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [step]);
  const set = <K extends keyof BoxEnquiry>(key: K, value: BoxEnquiry[K]) => { onActive(); setError(null); setE(prev => key === "boxTypes" ? pruneForTypes({ ...prev, [key]: value }) : { ...prev, [key]: value }); };
  const chooseBox = (type: BoxEnquiry["boxTypes"][number]) => set("boxTypes", [type]);
  const addPhotos = async (files: File[]) => {
    if (!files.length || photos.length >= 3) return;
    setAdding(true); setError(null);
    try {
      const added = await Promise.all(files.slice(0, 3 - photos.length).map(f => imageFileToDataUrl(f)));
      setPhotos(p => [...p, ...added].slice(0, 3));
    } catch (err) { setError({ message: err instanceof Error ? err.message : "Couldn’t add that photo." }); }
    finally { setAdding(false); if (file.current) file.current.value = ""; }
  };

  const saveEarlyContact = () => {
    const number = indianMobile(e.phone);
    if (!number || earlySaved.current === number) return;
    earlySaved.current = number;
    void syncSourcingChat({ id: id.current, title: "Premium box enquiry", brief: enquiryBrief(e), submitted: false, phone: number, turns: [{ query: "Premium box enquiry (in progress)", matches: [], images: [] }] }).catch(() => { earlySaved.current = ""; });
  };
  // Save a valid number as soon as it is typed, even if the visitor never taps Continue.
  useEffect(() => { if (indianMobile(e.phone)) saveEarlyContact(); }, [e.phone]); // eslint-disable-line react-hooks/exhaustive-deps
  const next = () => {
    const problem = stepFieldError(e, step);
    if (problem) { setError(problem); trackJourney({ kind: "form_error", step: String(step + 1), reason: step === 0 ? "format_required" : "details_invalid" }); return; }
    if (step === 0) { trackFormField("format", true, 0); trackFunnel("brief_shown"); }
    setStep(s => s + 1);
  };
  const submit = async () => {
    if (busy) return;
    trackFormField("quantity", Boolean(e.quantityExact), 1);
    trackFormField("message", Boolean(e.message.trim()), 1);
    trackFormField("photos", photos.length > 0, 1);
    const detailsProblem = stepFieldError(e, 1);
    if (detailsProblem) { setStep(1); setError(detailsProblem); trackJourney({ kind: "form_error", step: "2", reason: "details_invalid" }); return; }
    const contactProblem = stepFieldError(e, 2);
    if (contactProblem) { setError(contactProblem); trackJourney({ kind: "form_error", step: "2", reason: "phone_invalid" }); return; }
    const number = indianMobile(e.phone);
    if (!number) return;
    trackFormField("phone", true, 1);
    trackFormField("delivery", Boolean(e.pincode.trim()), 1);
    const brief = enquiryBrief(e);
    const payload = formSubmission(brief, number, enquiryText(e, photos.length), photos);
    if (!payload) return;
    setBusy(true); setError(null); trackFunnel("contact_submitted");
    try {
      const { error: insertError } = await supabase.from("requirement_submissions").insert({ ...payload, id: savedId.current, details: enquiryDetails(e, "v2", photos.length), attribution: { ...readAttribution(), enquiry_id: savedId.current, submitted_at: new Date().toISOString(), form_variant: "v2" } });
      if (insertError) throw new Error("Your enquiry couldn’t be sent. Please try again.");
      trackFunnel("request_saved"); window.__lovableEvents?.track?.("project.sourcing_request_submitted", { channel: "form" }); void flushVisitorTracking();
      await syncSourcingChat({ id: id.current, title: "Premium box enquiry", brief, submitted: true, submissionId: savedId.current, phone: number, turns: [{ query: payload.requirement, matches: [], images: photos }] }).catch(() => {});
      markConversionPending(id.current);
      try { localStorage.removeItem(KEY); localStorage.setItem("snaplogo.sourcing.thankyou", JSON.stringify({ leadId: id.current, submissionId: savedId.current, phone: number, brief })); } catch { /* saved anyway */ }
      navigate("/sourcing/thank-you");
    } catch (err) { trackJourney({ kind: "form_error", step: "2", reason: "save_failed" }); setError({ message: err instanceof Error ? err.message : "Please try again." }); }
    finally { setBusy(false); }
  };

  useEffect(() => {
    if (!error?.field) return;
    const input = document.getElementById(`v2-${error.field}`);
    input?.focus({ preventScroll: true });
    input?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [error]);

  const fieldError = (field: string) => error?.field === field ? <p role="alert" className="mt-1 text-xs font-medium text-destructive">{error.message}</p> : null;
  const group = (title: string, children: React.ReactNode, hint?: string, required?: boolean) => <fieldset className="min-w-0 space-y-1.5"><legend className={`mb-1.5 flex flex-wrap items-baseline gap-1.5 ${required ? "text-sm font-semibold" : "text-[13px] font-medium text-muted-foreground"}`}>{title}{required && <><span aria-hidden="true" className="text-primary">*</span><span className="sr-only">required</span></>}{hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}</legend>{children}</fieldset>;
  const text = (key: keyof BoxEnquiry, labelText: string, props: React.ComponentProps<typeof Input> = {}, optional?: boolean) => <div className="min-w-0"><label htmlFor={`v2-${key}`} className={`mb-1.5 block ${optional ? "text-[13px] font-medium text-muted-foreground" : "text-sm font-semibold"}`}>{labelText}</label><Input id={`v2-${key}`} className={`h-11 rounded-lg bg-card text-base ${optional ? "border-border/60" : ""} ${error?.field === String(key) ? "border-destructive" : ""}`} value={String(e[key] ?? "")} onChange={ev => set(key, ev.target.value as never)} {...props} />{fieldError(String(key))}</div>;

  return <form aria-label="Box enquiry form" noValidate onSubmit={ev => { ev.preventDefault(); if (step === 1) void submit(); else next(); }} className="enquiry-form mt-2 sm:mt-3 scroll-mt-20 overflow-hidden rounded-2xl border border-border/70 bg-card text-left sm:rounded-[24px]">
    <div className="border-b border-border px-4 pb-2.5 pt-3 sm:px-6 sm:pb-3 sm:pt-4">
      <ol aria-label="Enquiry progress" className="-mx-4 -mt-3 mb-2.5 grid grid-cols-2 border-b border-border bg-muted/40 sm:mx-0 sm:mt-0 sm:mb-2.5 sm:grid-cols-2 sm:gap-2 sm:border-0 sm:bg-transparent">{STEPS.map((l, i) => { const Icon = STEP_ICONS[i]; return <li key={l} aria-current={step === i ? "step" : undefined} className={`min-w-0 border-b-2 px-1 py-2.5 sm:border-b-0 sm:border-t-2 sm:px-0 sm:py-0 sm:pt-1.5 ${step === i ? "border-primary bg-card sm:bg-transparent" : "border-transparent sm:border-border"}`}><span className={`flex min-w-0 items-center justify-center gap-1.5 text-[11px] font-semibold sm:justify-start sm:text-xs ${step === i ? "text-primary" : i < step ? "text-foreground" : "text-muted-foreground"}`}>{Icon && <Icon className="h-4 w-4 shrink-0 sm:hidden" />}<span className="hidden sm:inline-flex">{i < step ? <Check className="h-3.5 w-3.5 shrink-0" /> : <span>{i + 1}.</span>}</span><span className="truncate">{l}</span></span></li>; })}</ol>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <span aria-hidden="true" className="h-7 w-1 rounded-full bg-primary" />
        <h2 ref={heading} tabIndex={-1} className="min-w-0 text-base font-semibold leading-tight outline-hidden sm:text-2xl">{["What kind of packaging are you looking for?", "Tell us about your project"][step]}</h2>
      </div>
      <p className="mt-1 pl-4 text-[13px] leading-5 text-muted-foreground sm:text-sm">{["Choose the closest option. Not sure? We’ll help you figure it out.", "Approximate details are absolutely fine. Our team can help you finalise the specifications."][step]}</p>
    </div>
    <fieldset disabled={busy} className={`min-w-0 px-4 sm:px-6 ${step === 1 ? "space-y-2.5 py-3" : step === 0 ? "space-y-3 py-3 sm:space-y-4 sm:py-5" : "space-y-4 py-4 sm:py-5"}`}>
      {step === 0 && group("Box type", <><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{BOX_TYPES.map(b => { const on = e.boxTypes.includes(b.id); const desktopOnly = ["display"].includes(b.id); return <Button key={b.id} type="button" variant="ghost" aria-pressed={on} onClick={() => chooseBox(b.id)} className={`relative h-auto min-w-0 flex-col items-center justify-start gap-1 whitespace-normal rounded-xl border p-1.5 text-center shadow-xs transition-colors sm:p-2 sm:pb-2.5 ${desktopOnly ? "hidden sm:flex" : "flex"} ${on ? "border-primary bg-accent/60 text-foreground ring-1 ring-primary hover:bg-accent" : "border-border bg-card hover:border-primary/50 active:border-primary"}`}>
         <span aria-hidden="true" className={`absolute right-1.5 top-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-card ${on ? "border-primary" : "border-muted-foreground/40"}`}>{on && <span className="h-2 w-2 rounded-full bg-primary" />}</span>
         <span className="flex h-20 w-full items-center justify-center overflow-hidden rounded-lg photo-frame isolate sm:h-28">{BOX_STYLE_IMAGES[b.id] ? <img src={BOX_STYLE_IMAGES[b.id]?.src} srcSet={BOX_STYLE_IMAGES[b.id]?.srcSet} sizes="(max-width: 639px) 120px, 260px" alt="" loading={desktopOnly ? "lazy" : "eager"} decoding="async" width={160} height={160} className={`h-full w-full object-contain mix-blend-multiply ${b.id === "corrugated" ? "translate-y-1 scale-[1.35]" : ""}`} /> : <HelpCircle className="h-8 w-8 text-muted-foreground sm:h-10 sm:w-10" />}</span>
        <span className={`text-xs font-semibold leading-4 ${on ? "text-primary" : ""}`}>{b.label}</span>{b.use && <span className="-mt-0.5 hidden text-[10px] leading-3 text-muted-foreground sm:block">{b.use}</span>}
      </Button>; })}</div>{fieldError("boxTypes")}<p className="text-xs leading-4 text-muted-foreground">Don’t know the exact box type? That’s okay. We’ll help you find the right packaging.</p></>, undefined, true)}
      {step === 1 && <>
        <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:gap-x-5 sm:gap-y-3">
          <div className="order-1 min-w-0 sm:col-start-1 sm:row-start-1">
            <input ref={file} type="file" accept="image/*" multiple hidden onChange={ev => void addPhotos(Array.from(ev.target.files ?? []))} />
            <div className={`grid h-full min-w-0 items-center gap-2 rounded-lg border border-dashed border-primary/60 bg-accent/50 p-2 sm:flex sm:flex-col sm:p-3 ${photos.length ? "grid-cols-[minmax(0,1fr)_auto]" : "grid-cols-1"}`}>
            <Button type="button" variant="ghost" disabled={adding || photos.length >= 3} onClick={() => file.current?.click()} aria-label="Upload your design or reference image, optional, up to 3" className="group h-auto min-h-12 w-full flex-1 justify-start gap-2.5 whitespace-normal rounded-md px-1 py-1 text-left text-foreground hover:bg-accent hover:text-foreground sm:flex-col sm:justify-center sm:gap-2 sm:py-3 sm:text-center">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary sm:h-12 sm:w-12">{adding ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5 sm:h-7 sm:w-7" />}</span>
              <span className="min-w-0 break-words leading-5"><span className="block text-sm font-semibold">{adding ? "Uploading…" : photos.length >= 3 ? "3 images attached" : photos.length ? "Add another image" : "Upload box reference images"}</span><span className="block text-xs font-normal leading-4 text-muted-foreground">{photos.length ? `${photos.length} of 3 attached` : "Logo, dieline or reference photo"}</span><span className="hidden pt-1 text-xs font-normal text-muted-foreground sm:block">Optional · Up to 3 images</span></span>
            </Button>
            {photos.length > 0 && <div aria-label="Attached design images" className={`flex flex-wrap items-center gap-3 px-1 pb-1 pt-2 sm:justify-center ${photos.length > 1 ? "col-span-2" : ""}`}>{photos.map((src, i) => <span key={i} className="relative inline-flex"><img src={src} alt={`Design reference ${i + 1}`} className="h-11 w-11 rounded-md border border-border object-cover sm:h-16 sm:w-16" /><Button type="button" variant="outline" size="icon" aria-label={`Remove photo ${i + 1}`} onClick={() => setPhotos(p => p.filter((_, j) => j !== i))} className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-card"><X className="h-3.5 w-3.5" /></Button></span>)}{photos.length < 3 && <Button type="button" variant="outline" disabled={adding} aria-label="Add more reference images" onClick={() => file.current?.click()} className="hidden h-16 w-16 flex-col gap-0.5 rounded-md border-dashed bg-transparent p-1 text-muted-foreground sm:flex"><ImagePlus className="h-5 w-5" /><span className="text-[10px]">Add more</span></Button>}</div>}
            </div>
          </div>
          <div className="order-2 min-w-0 sm:col-start-2 sm:row-start-1"><label htmlFor="v2-quantityExact" className="mb-1.5 flex h-6 items-center gap-1 text-sm font-semibold">Quantity<span aria-hidden="true" className="text-primary">*</span><span className="sr-only">required</span></label><div className="relative"><Input id="v2-quantityExact" className={`h-11 rounded-lg bg-card pr-16 text-base ${error?.field === "quantityExact" ? "border-destructive" : ""}`} inputMode="numeric" placeholder="e.g. 1,000" maxLength={12} value={e.quantityExact} onChange={ev => set("quantityExact", ev.target.value)} aria-required="true" /><span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">boxes</span></div>
            {fieldError("quantityExact")}
          </div>
        </div>
        <div className="min-w-0"><label htmlFor="v2-message" className="mb-1.5 flex h-6 items-center gap-1 text-[13px] font-medium text-muted-foreground">Message / Project Details</label><textarea id="v2-message" rows={2} maxLength={500} placeholder="e.g. printing, finish, material, board strength" value={e.message} onChange={ev => set("message", ev.target.value)} className={`w-full resize-none rounded-lg bg-card px-3 py-2.5 text-base leading-5 outline-none focus-visible:ring-2 focus-visible:ring-ring ${error?.field === "message" ? "border-destructive" : "border-border/60"} border`} />{fieldError("message")}</div>

        <div className="grid gap-3 sm:grid-cols-2">
          {text("brand", "Brand / company name (optional)", { autoComplete: "organization", maxLength: 120 }, true)}
          {text("pincode", "Delivery city / PIN code", { inputMode: "numeric", maxLength: 6, placeholder: "e.g. 400001", autoComplete: "postal-code" }, true)}
        </div>
        <div><label htmlFor="v2-phone" className="mb-1.5 flex items-center gap-1 text-sm font-semibold">WhatsApp number<span aria-hidden="true" className="text-primary">*</span><span className="sr-only">required</span></label><div className={`flex h-11 items-center overflow-hidden rounded-lg border bg-card focus-within:ring-2 focus-within:ring-ring ${error?.field === "phone" ? "border-destructive" : "border-input"}`}><span className="border-r border-border px-3 text-base text-muted-foreground">+91</span><Input id="v2-phone" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={16} value={e.phone} onChange={ev => set("phone", ev.target.value)} placeholder="98765 43210" aria-required="true" className="h-11 rounded-none border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0" /></div>{error?.field === "phone" ? <p role="alert" className="mt-1 text-xs font-medium text-destructive">{error.message}</p> : <p className="mt-1 text-xs text-muted-foreground">Used only to send your quotes on WhatsApp — no spam.</p>}</div>
        <p className="text-xs font-medium text-foreground">Free sourcing · No commission · No obligation to purchase</p>
      </>}
    </fieldset>
    {error && !error.field && <p role="alert" className="px-4 pb-4 text-sm text-destructive sm:px-7">{error.message}</p>}
    <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t border-border bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-7">{step > 0 ? <Button type="button" variant="ghost" disabled={busy} className="h-12 rounded-full px-3" onClick={() => { setStep(s => s - 1); setError(null); }}><ArrowLeft />Back</Button> : <span className="text-xs text-muted-foreground">Free · No commission · <span aria-hidden="true" className="text-primary">*</span> Required</span>}<Button type="submit" disabled={busy} className="h-12 rounded-full px-5 text-sm font-semibold">{busy ? <Loader2 className="animate-spin" /> : <><span className="sm:hidden">{step === 1 ? "Get My Free Quotes" : "Continue"}</span><span className="hidden sm:inline">{["Continue to project details", "Get My Free Quotes"][step]}</span><ArrowRight /></>}</Button></div>
  </form>;
}
