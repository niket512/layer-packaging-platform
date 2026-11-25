import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Clock, HelpCircle, Ruler, Loader2, Search, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { imageFileToDataUrl } from "@/lib/image-data-url";
import { supabase } from "@/integrations/supabase/client";
import { readAttribution } from "@/lib/attribution";
import { markConversionPending } from "@/lib/sourcing-conversion";
import { syncSourcingChat } from "@/lib/chat-monitoring";
import { flushVisitorTracking, trackFormField, trackFunnel, trackJourney } from "@/lib/visitor-tracking";
import { indianMobile, formSubmission } from "@/lib/sourcing-form";
import { BOX_TYPES, PRODUCT_CATEGORIES, WALLS, emptyEnquiry, enquiryBrief, enquiryDetails, enquiryText, materialOptions, needsWall, pruneForTypes, stepErrors, type BoxEnquiry, type BoxType } from "@/lib/box-enquiry";

// Photos taken from the designs catalogue.
const IMAGES: Partial<Record<BoxType, string>> = {
  corrugated: "https://res.cloudinary.com/daxralyfk/image/upload/v1787976525/uploads/10x13_5x7_75-brown-taped-carton-box-thumbnail-boxwaale.webp",
  mailer: "https://www.china-paperbox.com/images/products/blush-pink-beauty-unboxing-mailer-box.jpg",
  product: "https://www.china-paperbox.com/images/products/business-dress-shirt-folding-carton.jpg",
  rigid: "https://www.china-paperbox.com/images/products/champagne-sparkling-wine-rigid-box.jpg",
  sleeve: "https://www.china-paperbox.com/images/products/artisan-soap-sleeve-drawer-box.jpg",
  gable: "https://www.china-paperbox.com/images/products/everyday-kraft-gable-carry-box.jpg",
  display: "https://www.china-paperbox.com/images/products/corrugated-hinged-lid-display-box.jpg",
  pillow: "https://www.china-paperbox.com/images/products/curved-pillow-fold-gift-carton.jpg",
  diecut: "https://www.china-paperbox.com/images/products/hexagonal-geometric-foldable-gift-carton.jpg",
  gift: "https://res.cloudinary.com/daxralyfk/image/upload/v1784444272/uploads/12x10x4-boxwaale-thumbnail.webp",
};
const STEPS = ["Box type", "Project details", "Contact"];
const KEY = "snaplogo.form.v2.draft";
const chip = (on: boolean) => `inline-flex min-h-11 items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm transition-colors ${on ? "border-primary bg-accent font-medium text-primary" : "border-border bg-card text-foreground hover:border-primary/40"}`;

export function PremiumBoxForm({ onActive }: { onActive: () => void }) {
  const navigate = useNavigate();
  const saved = useRef<{ step?: number; e?: BoxEnquiry; id?: string } | null>(null);
  if (saved.current === null) { try { saved.current = JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { saved.current = {}; } }
  const [step, setStep] = useState(() => Math.min(2, Math.max(0, saved.current?.step ?? 0)));
  const [e, setE] = useState<BoxEnquiry>(() => ({ ...emptyEnquiry(), ...saved.current?.e, sizeUnknown: false }));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const id = useRef(saved.current?.id ?? crypto.randomUUID());
  const savedId = useRef(crypto.randomUUID());
  const heading = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify({ step, e, id: id.current })); } catch { /* memory only */ } }, [step, e]);
  useEffect(() => {
    trackJourney({ kind: "form_step", step: String(step + 1), category: "form-v2" });
    if (first.current) { first.current = false; return; }
    heading.current?.focus({ preventScroll: true });
    const form = heading.current?.closest("form");
    if (form && form.getBoundingClientRect().top < 64) form.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [step]);
  const set = <K extends keyof BoxEnquiry>(key: K, value: BoxEnquiry[K]) => { onActive(); setError(""); setE(prev => key === "boxTypes" ? pruneForTypes({ ...prev, [key]: value }) : { ...prev, [key]: value }); };
  const toggle = <T extends string>(list: T[], value: T, exclusive?: T) => list.includes(value) ? list.filter(v => v !== value) : value === exclusive ? [value] : [...list.filter(v => v !== exclusive), value];
  const materials = useMemo(() => materialOptions(e.boxTypes), [e.boxTypes]);
  const q = search.trim().toLowerCase();
  const suggestions = q ? PRODUCT_CATEGORIES.filter(p => p !== "Other" && !e.products.includes(p) && p.toLowerCase().includes(q)).slice(0, 6) : [];
  const exact = PRODUCT_CATEGORIES.some(p => p.toLowerCase() === q);
  const pickProduct = (p: string) => { set("products", [...e.products, p]); setSearch(""); };
  const addCustom = () => { const v = search.trim().slice(0, 60); if (!v) return; setE(prev => ({ ...prev, products: prev.products.includes("Other") ? prev.products : [...prev.products, "Other"], productOther: [prev.productOther.trim(), v].filter(Boolean).join(", ").slice(0, 120) })); onActive(); setSearch(""); };
  const QUICK = ["Beauty & skincare", "Apparel & fashion", "Food & snacks", "Electronics & gadgets"];
  const dims = useRef<(HTMLInputElement | null)[]>([]);
  const onDim = (i: number, k: "length" | "width" | "height", raw: string) => {
    const jump = /[x*\s]$/i.test(raw);
    const v = raw.replace(/[^0-9.]/g, "");
    set(k, v);
    if (i < 2 && (jump || v.replace(".", "").length >= 3)) dims.current[i + 1]?.focus();
  };
  const removeProduct = (p: string) => setE(prev => ({ ...prev, products: prev.products.filter(x => x !== p), productOther: p === "Other" ? "" : prev.productOther }));
  const addPhotos = async (files: File[]) => {
    if (!files.length || photos.length >= 3) return;
    setAdding(true); setError("");
    try {
      const added = await Promise.all(files.slice(0, 3 - photos.length).map(f => imageFileToDataUrl(f)));
      setPhotos(p => [...p, ...added].slice(0, 3));
    } catch (err) { setError(err instanceof Error ? err.message : "Couldn’t add that photo."); }
    finally { setAdding(false); if (file.current) file.current.value = ""; }
  };

  const next = () => {
    const problem = stepErrors(e, step);
    if (problem) { setError(problem); trackJourney({ kind: "form_error", step: String(step + 1), reason: step === 0 ? "format_required" : "phone_invalid" }); return; }
    if (step === 0) { trackFormField("format", true, 0); trackFunnel("brief_shown"); }
    if (step === 1) {
      (["quantity", "size", "material", "wall"] as const).forEach((f, i) => trackFormField(f, Boolean([e.quantityExact, e.sizeUnknown || e.length, e.material, e.wall][i]), 1));
      trackFormField("photos", photos.length > 0, 1);
      trackFunnel("contact_shown");
    }
    setStep(s => s + 1);
  };
  const submit = async () => {
    if (busy) return;
    const problem = stepErrors(e, 2);
    if (problem) { setError(problem); trackJourney({ kind: "form_error", step: "3", reason: "phone_invalid" }); return; }
    const number = indianMobile(e.phone)!;
    const brief = enquiryBrief(e);
    const payload = formSubmission(brief, number, enquiryText(e, photos.length), photos);
    if (!payload) return;
    setBusy(true); setError(""); trackFormField("phone", true, 2); trackFunnel("contact_submitted");
    try {
      const { error: insertError } = await supabase.from("requirement_submissions").insert({ ...payload, id: savedId.current, details: enquiryDetails(e, "v2", photos.length), attribution: { ...readAttribution(), enquiry_id: savedId.current, submitted_at: new Date().toISOString(), form_variant: "v2" } });
      if (insertError) throw new Error("Your enquiry couldn’t be sent. Please try again.");
      trackFunnel("request_saved"); window.__lovableEvents?.track?.("project.sourcing_request_submitted", { channel: "form" }); void flushVisitorTracking();
      await syncSourcingChat({ id: id.current, title: "Premium box enquiry", brief, submitted: true, submissionId: savedId.current, phone: number, turns: [{ query: payload.requirement, matches: [], images: photos }] }).catch(() => {});
      markConversionPending(id.current);
      try { localStorage.removeItem(KEY); localStorage.setItem("snaplogo.sourcing.thankyou", JSON.stringify({ leadId: id.current, submissionId: savedId.current, phone: number, brief })); } catch { /* saved anyway */ }
      navigate("/sourcing/thank-you");
    } catch (err) { trackJourney({ kind: "form_error", step: "3", reason: "save_failed" }); setError(err instanceof Error ? err.message : "Please try again."); }
    finally { setBusy(false); }
  };

  const group = (title: string, children: React.ReactNode, hint?: string, required?: boolean) => <fieldset aria-required={required || undefined} className="min-w-0 space-y-2"><legend className="mb-2 flex flex-wrap items-baseline gap-1.5 text-sm font-semibold">{title}{required && <span aria-hidden="true" className="text-primary">*</span>}{hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}</legend>{children}</fieldset>;
  const single = (key: "material" | "wall", options: string[], rec?: string) => <div className="flex flex-wrap items-center gap-2">{options.map(o => <button key={o} type="button" aria-pressed={e[key] === o} onClick={() => set(key, e[key] === o ? "" : o)} className={chip(e[key] === o)}>{e[key] === o && <Check className="h-3.5 w-3.5" />}{o}</button>)}</div>;
  const text = (key: keyof BoxEnquiry, labelText: string, props: React.ComponentProps<typeof Input> = {}) => <div className="min-w-0"><label htmlFor={`v2-${key}`} className="mb-1.5 block text-sm font-semibold">{labelText}</label><Input id={`v2-${key}`} className="h-11 rounded-lg bg-card text-base" value={String(e[key] ?? "")} onChange={ev => set(key, ev.target.value as never)} {...props} /></div>;

  return <form aria-label="Box enquiry form" noValidate onSubmit={ev => { ev.preventDefault(); if (step === 2) void submit(); else next(); }} className="mt-3 scroll-mt-20 overflow-hidden rounded-2xl border border-border bg-card text-left shadow-lg shadow-primary/5">
    <div className="border-b border-border px-4 pb-3 pt-3.5 sm:px-6 sm:pt-4">
      <ol aria-label="Enquiry progress" className="mb-2.5 grid grid-cols-3 gap-2">{STEPS.map((l, i) => <li key={l} aria-current={step === i ? "step" : undefined} className={`min-w-0 border-t-2 pt-1.5 ${i <= step ? "border-primary" : "border-border"}`}><span className={`flex items-center gap-1.5 text-[11px] font-semibold sm:text-xs ${step === i ? "text-primary" : i < step ? "text-foreground" : "text-muted-foreground"}`}>{i < step ? <Check className="h-3.5 w-3.5 shrink-0" /> : <span>{i + 1}.</span>}<span className="truncate">{l}</span></span></li>)}</ol>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <h2 ref={heading} tabIndex={-1} className="text-lg font-semibold leading-tight outline-none sm:text-xl">{["What kind of custom box are you looking to create?", "Tell us about your project", "Where should we send your quotes?"][step]}</h2>
        <p className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-primary"><Clock className="h-3 w-3" />Multiple quotes within 6 hours</p>
      </div>
      {step === 2 && <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{["", "", "We coordinate your quotes on WhatsApp — no spam."][step]}</p>}
    </div>
    <fieldset disabled={busy} className="min-w-0 space-y-4 px-4 py-4 sm:px-6 sm:py-5">
      {step === 0 && group("Box type", <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{BOX_TYPES.map(b => { const on = e.boxTypes.includes(b.id); return <button key={b.id} type="button" aria-pressed={on} onClick={() => set("boxTypes", toggle(e.boxTypes, b.id, "unsure"))} className={`relative flex min-w-0 flex-col items-center gap-1 rounded-xl border p-2 pb-2.5 pt-2 text-center transition-colors ${on ? "border-primary bg-accent/60 ring-1 ring-primary" : b.id === "custom" ? "border-[1.5px] border-dashed border-muted-foreground/40 hover:border-primary/60" : "border-border hover:border-primary/40"}`}>
        <span className="flex h-16 w-full items-center justify-center overflow-hidden rounded-lg bg-muted/40 sm:h-20">{IMAGES[b.id] ? <img src={IMAGES[b.id]} alt="" loading="lazy" width={200} height={200} className={`h-full w-full object-contain mix-blend-multiply ${b.id === "corrugated" ? "translate-y-1 scale-[1.35]" : ""}`} /> : b.id === "custom" ? <Ruler className="h-7 w-7 text-primary" /> : <HelpCircle className="h-6 w-6 text-muted-foreground" />}</span>
        <span className={`text-xs font-semibold leading-4 ${on ? "text-primary" : ""}`}>{b.label}</span>{b.use && <span className="-mt-0.5 text-[10px] leading-3 text-muted-foreground">{b.use}</span>}
        <span className={`absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full border ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>{on && <Check className="h-2.5 w-2.5" />}</span>
      </button>; })}</div>, "Select one or more", true)}
      {step === 1 && <>
        {group("What product will go inside the box?", <>
          {e.products.length > 0 && <div className="flex flex-wrap gap-2">{e.products.map(p => <span key={p} className="inline-flex min-h-9 items-center gap-1 rounded-full border border-primary bg-accent py-1 pl-3 pr-1 text-sm font-medium text-primary">{p === "Other" ? e.productOther || "Other" : p}<button type="button" aria-label={`Remove ${p === "Other" ? e.productOther || "Other" : p}`} onClick={() => removeProduct(p)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-primary/10"><X className="h-3.5 w-3.5" /></button></span>)}</div>}
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input role="combobox" aria-expanded={Boolean(q)} aria-controls="v2-product-list" aria-label="Type your product" value={search} onChange={ev => setSearch(ev.target.value)} onKeyDown={ev => { if (ev.key === "Enter") { ev.preventDefault(); if (suggestions[0]) pickProduct(suggestions[0]); else if (!exact) addCustom(); } if (ev.key === "Escape") setSearch(""); }} placeholder={e.products.length ? "Add another product" : "Start typing, e.g. skincare, candles"} className="h-11 rounded-lg bg-card pl-9 text-base" />
            {q && <ul id="v2-product-list" role="listbox" className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg">{suggestions.map(p => <li key={p} role="option" aria-selected={false}><button type="button" onClick={() => pickProduct(p)} className="flex min-h-11 w-full items-center px-3 text-left text-sm hover:bg-accent">{p}</button></li>)}{!exact && <li role="option" aria-selected={false}><button type="button" onClick={addCustom} className="flex min-h-11 w-full items-center gap-1 px-3 text-left text-sm text-primary hover:bg-accent">Add “{search.trim()}”</button></li>}</ul>}
          </div>
        </>, "Add one or more")}
        <div className="min-w-0"><div className="mb-1.5 flex h-6 items-center justify-between gap-2"><span id="v2-dims" className="text-sm font-semibold">Box dimensions</span><span className="flex items-center gap-2">
            <span role="group" aria-label="Unit" className="inline-flex rounded-md border border-border p-0.5 text-xs">{(["in", "cm"] as const).map(u => <button key={u} type="button" aria-pressed={(e.unit ?? "in") === u} disabled={e.sizeUnknown} onClick={() => set("unit", u)} className={`rounded px-2 py-0.5 ${(e.unit ?? "in") === u ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{u}</button>)}</span>
            </span></div>
            <div aria-labelledby="v2-dims" role="group" className={`grid grid-cols-3 gap-2 transition-opacity ${e.sizeUnknown ? "opacity-40" : ""}`}>{(["length", "width", "height"] as const).map((k, i) => <Input key={k} ref={el => { dims.current[i] = el; }} id={`v2-${k}`} aria-label={`${k} (${e.unit ?? "in"})`} disabled={e.sizeUnknown} inputMode="decimal" maxLength={7} placeholder={`${k[0].toUpperCase()} (${e.unit ?? "in"})`} value={e[k]} onChange={ev => onDim(i, k, ev.target.value)} className="h-11 rounded-lg bg-card text-base" />)}</div>
            </div>
        {group("Material preference", <>{single("material", materials)}{e.material === "Other" && <Input autoFocus aria-label="Which material?" placeholder="Which material? e.g. metallic board" maxLength={120} value={e.materialOther} onChange={ev => set("materialOther", ev.target.value)} className="h-10 max-w-sm rounded-lg bg-card text-base" />}</>)}
        {needsWall(e.boxTypes) && group("Board strength (corrugated wall)", single("wall", WALLS, e.products.some(p => /Electronics|Footwear|Food|Chocolates|Dry fruits|Bakery/.test(p)) ? "5-ply" : "3-ply"))}
        <div className="flex flex-wrap items-center gap-2">
          <input ref={file} type="file" accept="image/*" multiple hidden onChange={ev => void addPhotos(Array.from(ev.target.files ?? []))} />
          <button type="button" disabled={adding || photos.length >= 3} onClick={() => file.current?.click()} aria-label="Add a design or reference photo, optional, up to 3" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-dashed border-border bg-accent/30 px-3 text-sm hover:bg-accent/60 disabled:opacity-60">
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4 text-primary" />}
            <span>{photos.length ? "Add another photo" : "Design / reference photo"}</span>
            <span className="text-xs font-normal text-muted-foreground">Optional</span>
          </button>
          {photos.map((src, i) => <span key={i} className="relative inline-flex"><img src={src} alt={`Design reference ${i + 1}`} className="h-10 w-10 rounded-lg border border-border object-cover" /><button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => setPhotos(p => p.filter((_, j) => j !== i))} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button></span>)}
        </div>
        <div className="min-w-0"><label htmlFor="v2-quantityExact" className="mb-1.5 flex h-6 items-center gap-1 text-sm font-semibold">Exact quantity<span aria-hidden="true" className="text-primary">*</span><span className="sr-only">required</span></label><Input id="v2-quantityExact" className="h-11 rounded-lg bg-card text-base sm:max-w-xs" inputMode="numeric" placeholder="e.g. 1000" maxLength={12} value={e.quantityExact} onChange={ev => set("quantityExact", ev.target.value)} aria-required="true" />
        </div>
      </>}
      {step === 2 && <>
        <div className="grid gap-3 sm:grid-cols-2">
          {text("brand", "Brand / company name (optional)", { autoComplete: "organization", maxLength: 120 })}
          {text("pincode", "Delivery city / PIN code", { inputMode: "numeric", maxLength: 6, placeholder: "e.g. 400001", autoComplete: "postal-code" })}
        </div>
        {text("productDetails", "Anything else? (optional)", { placeholder: "e.g. matte lamination, gold foil, window patch", maxLength: 300 })}
        <div><label htmlFor="v2-phone" className="mb-1.5 flex items-center gap-1 text-sm font-semibold">WhatsApp number<span aria-hidden="true" className="text-primary">*</span><span className="sr-only">required</span></label><div className="flex h-11 items-center overflow-hidden rounded-lg border border-input bg-card focus-within:ring-2 focus-within:ring-ring"><span className="border-r border-border px-3 text-base text-muted-foreground">+91</span><Input id="v2-phone" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={16} value={e.phone} onChange={ev => set("phone", ev.target.value)} placeholder="98765 43210" aria-required="true" className="h-11 rounded-none border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0" /></div><p className="mt-1 text-xs text-muted-foreground">Quotes are shared on WhatsApp. No spam.</p></div>
      </>}
    </fieldset>
    {error && <p role="alert" className="px-4 pb-4 text-sm text-destructive sm:px-7">{error}</p>}
    <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t border-border bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-7">{step > 0 ? <Button type="button" variant="ghost" disabled={busy} className="h-12 rounded-full px-3" onClick={() => { setStep(s => s - 1); setError(""); }}><ArrowLeft />Back</Button> : <span className="text-xs text-muted-foreground">Free · No commission · <span aria-hidden="true" className="text-primary">*</span> Required</span>}<Button type="submit" disabled={busy} className="h-12 rounded-full px-5 text-sm font-semibold">{busy ? <Loader2 className="animate-spin" /> : <>{["Continue to project details", "Continue to contact", "Submit my enquiry"][step]}<ArrowRight /></>}</Button></div>
  </form>;
}
