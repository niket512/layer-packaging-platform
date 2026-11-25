import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Clock, HelpCircle, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { readAttribution } from "@/lib/attribution";
import { markConversionPending } from "@/lib/sourcing-conversion";
import { syncSourcingChat } from "@/lib/chat-monitoring";
import { flushVisitorTracking, trackFormField, trackFunnel, trackJourney } from "@/lib/visitor-tracking";
import { indianMobile, formSubmission } from "@/lib/sourcing-form";
import { BOX_TYPES, PRODUCT_CATEGORIES, QUANTITY_BANDS, WALLS, emptyEnquiry, enquiryBrief, enquiryDetails, enquirySummary, enquiryText, materialOptions, needsWall, pruneForTypes, stepErrors, type BoxEnquiry, type BoxType } from "@/lib/box-enquiry";

// Photos taken from the designs catalogue.
const IMAGES: Partial<Record<BoxType, string>> = {
  corrugated: "https://res.cloudinary.com/daxralyfk/image/upload/v1787976525/uploads/10x13_5x7_75-brown-taped-carton-box-thumbnail-boxwaale.webp",
  mailer: "https://www.china-paperbox.com/images/products/blush-pink-beauty-unboxing-mailer-box.jpg",
  product: "https://www.china-paperbox.com/images/products/business-dress-shirt-folding-carton.jpg",
  rigid: "https://www.china-paperbox.com/images/products/champagne-sparkling-wine-rigid-box.jpg",
  diecut: "https://www.china-paperbox.com/images/products/hexagonal-geometric-foldable-gift-carton.jpg",
  gift: "https://res.cloudinary.com/daxralyfk/image/upload/v1784444272/uploads/12x10x4-boxwaale-thumbnail.webp",
};
const STEPS = ["Box type", "Project details", "Contact"];
const KEY = "snaplogo.form.v2.draft";
const chip = (on: boolean) => `inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-colors ${on ? "border-primary bg-accent font-medium text-primary" : "border-border bg-card text-foreground hover:border-primary/40"}`;

export function PremiumBoxForm({ onActive }: { onActive: () => void }) {
  const navigate = useNavigate();
  const saved = useRef<{ step?: number; e?: BoxEnquiry; id?: string } | null>(null);
  if (saved.current === null) { try { saved.current = JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { saved.current = {}; } }
  const [step, setStep] = useState(() => Math.min(2, Math.max(0, saved.current?.step ?? 0)));
  const [e, setE] = useState<BoxEnquiry>(() => ({ ...emptyEnquiry(), ...saved.current?.e }));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
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
  const removeProduct = (p: string) => setE(prev => ({ ...prev, products: prev.products.filter(x => x !== p), productOther: p === "Other" ? "" : prev.productOther }));

  const next = () => {
    const problem = stepErrors(e, step);
    if (problem) { setError(problem); trackJourney({ kind: "form_error", step: String(step + 1), reason: step === 0 ? "format_required" : "phone_invalid" }); return; }
    if (step === 0) { trackFormField("format", true, 0); trackFunnel("brief_shown"); }
    if (step === 1) {
      (["quantity", "size", "material", "wall"] as const).forEach((f, i) => trackFormField(f, Boolean([e.quantityBand || e.quantityExact, e.sizeUnknown || e.length, e.material, e.wall][i]), 1));
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
    const payload = formSubmission(brief, number, enquiryText(e), []);
    if (!payload) return;
    setBusy(true); setError(""); trackFormField("phone", true, 2); trackFunnel("contact_submitted");
    try {
      const { error: insertError } = await supabase.from("requirement_submissions").insert({ ...payload, id: savedId.current, details: enquiryDetails(e, "v2"), attribution: { ...readAttribution(), enquiry_id: savedId.current, submitted_at: new Date().toISOString(), form_variant: "v2" } });
      if (insertError) throw new Error("Your enquiry couldn’t be sent. Please try again.");
      trackFunnel("request_saved"); window.__lovableEvents?.track?.("project.sourcing_request_submitted", { channel: "form" }); void flushVisitorTracking();
      await syncSourcingChat({ id: id.current, title: "Premium box enquiry", brief, submitted: true, submissionId: savedId.current, phone: number, turns: [{ query: payload.requirement, matches: [], images: [] }] }).catch(() => {});
      markConversionPending(id.current);
      try { localStorage.removeItem(KEY); localStorage.setItem("snaplogo.sourcing.thankyou", JSON.stringify({ leadId: id.current, submissionId: savedId.current, phone: number, brief })); } catch { /* saved anyway */ }
      navigate("/sourcing/thank-you");
    } catch (err) { trackJourney({ kind: "form_error", step: "3", reason: "save_failed" }); setError(err instanceof Error ? err.message : "Please try again."); }
    finally { setBusy(false); }
  };

  const group = (title: string, children: React.ReactNode, hint?: string) => <fieldset className="min-w-0 space-y-2.5"><legend className="mb-2.5 flex flex-wrap items-baseline gap-1.5 text-sm font-semibold">{title}{hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}</legend>{children}</fieldset>;
  const single = (key: "material" | "wall" | "quantityBand", options: string[]) => <div className="flex flex-wrap gap-2">{options.map(o => <button key={o} type="button" aria-pressed={e[key] === o} onClick={() => set(key, e[key] === o ? "" : o)} className={chip(e[key] === o)}>{e[key] === o && <Check className="h-3.5 w-3.5" />}{o}</button>)}</div>;
  const text = (key: keyof BoxEnquiry, labelText: string, props: React.ComponentProps<typeof Input> = {}) => <div className="min-w-0"><label htmlFor={`v2-${key}`} className="mb-1.5 block text-sm font-semibold">{labelText}</label><Input id={`v2-${key}`} className="h-11 rounded-lg bg-card text-base" value={String(e[key] ?? "")} onChange={ev => set(key, ev.target.value as never)} {...props} /></div>;

  return <form aria-label="Box enquiry form" noValidate onSubmit={ev => { ev.preventDefault(); if (step === 2) void submit(); else next(); }} className="mt-3 scroll-mt-20 overflow-hidden rounded-2xl border border-border bg-card text-left shadow-lg shadow-primary/5">
    <div className="border-b border-border px-4 pb-4 pt-4 sm:px-7 sm:pt-5">
      <ol aria-label="Enquiry progress" className="mb-4 grid grid-cols-3 gap-3">{STEPS.map((l, i) => <li key={l} aria-current={step === i ? "step" : undefined} className={`min-w-0 border-t-2 pt-2 ${i <= step ? "border-primary" : "border-border"}`}><span className={`flex items-center gap-1.5 text-xs font-semibold sm:text-sm ${step === i ? "text-primary" : i < step ? "text-foreground" : "text-muted-foreground"}`}>{i < step ? <Check className="h-3.5 w-3.5 shrink-0" /> : <span>{i + 1}.</span>}<span className="truncate">{l}</span></span></li>)}</ol>
      <h2 ref={heading} tabIndex={-1} className="text-xl font-semibold leading-tight outline-none sm:text-2xl">{["What kind of box are you looking to create?", "Tell us about your project", "Where should we send your quotes?"][step]}</h2>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{["From premium rigid boxes to custom-printed corrugated packaging — tell us what you need and compare multiple manufacturer quotes.", "A few details help us find manufacturers who can meet your requirements. Everything here is optional.", "Share your contact details so we can coordinate your manufacturer quotations."][step]}</p>
      <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary"><Clock className="h-3.5 w-3.5" />Multiple quotes within 6 hours</p>
    </div>
    <fieldset disabled={busy} className="min-w-0 space-y-6 px-4 py-5 sm:px-7 sm:py-6">
      {step === 0 && <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">{BOX_TYPES.map(b => { const on = e.boxTypes.includes(b.id); return <button key={b.id} type="button" aria-pressed={on} onClick={() => set("boxTypes", toggle(e.boxTypes, b.id, "unsure"))} className={`relative flex min-w-0 flex-col overflow-hidden rounded-xl border text-left transition-all motion-safe:hover:-translate-y-0.5 hover:shadow-sm ${on ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary/40"}`}>
        <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-muted/40">{IMAGES[b.id] ? <img src={IMAGES[b.id]} alt="" loading="lazy" width={480} height={480} className="absolute inset-0 h-full w-full object-contain p-2 mix-blend-multiply" /> : <HelpCircle className="h-10 w-10 text-muted-foreground" />}</div>
        <span className="block px-3 pb-3 pt-2"><span className={`block text-sm font-semibold leading-5 ${on ? "text-primary" : ""}`}>{b.label}</span><span className="mt-0.5 block text-xs leading-4 text-muted-foreground">{b.description}</span></span>
        <span className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>{on && <Check className="h-3 w-3" />}</span>
      </button>; })}<p className="col-span-full text-xs text-muted-foreground">You can pick more than one.</p></div>}
      {step === 1 && <>
        {group("What product will go inside the box?", <>
          {e.products.length > 0 && <div className="flex flex-wrap gap-2">{e.products.map(p => <span key={p} className="inline-flex min-h-9 items-center gap-1 rounded-full border border-primary bg-accent py-1 pl-3 pr-1 text-sm font-medium text-primary">{p === "Other" ? e.productOther || "Other" : p}<button type="button" aria-label={`Remove ${p === "Other" ? e.productOther || "Other" : p}`} onClick={() => removeProduct(p)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-primary/10"><X className="h-3.5 w-3.5" /></button></span>)}</div>}
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input role="combobox" aria-expanded={Boolean(q)} aria-controls="v2-product-list" aria-label="Type your product" value={search} onChange={ev => setSearch(ev.target.value)} onKeyDown={ev => { if (ev.key === "Enter") { ev.preventDefault(); if (suggestions[0]) pickProduct(suggestions[0]); else if (!exact) addCustom(); } if (ev.key === "Escape") setSearch(""); }} placeholder={e.products.length ? "Add another product" : "Start typing, e.g. skincare, candles"} className="h-11 rounded-lg pl-9 text-base" />
            {q && <ul id="v2-product-list" role="listbox" className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg">{suggestions.map(p => <li key={p} role="option" aria-selected={false}><button type="button" onClick={() => pickProduct(p)} className="flex min-h-11 w-full items-center px-3 text-left text-sm hover:bg-accent">{p}</button></li>)}{!exact && <li role="option" aria-selected={false}><button type="button" onClick={addCustom} className="flex min-h-11 w-full items-center gap-1 px-3 text-left text-sm text-primary hover:bg-accent">Add “{search.trim()}”</button></li>}</ul>}
          </div>
        </>, "Add one or more")}
        {group("How many boxes do you need?", <>{single("quantityBand", QUANTITY_BANDS)}{text("quantityExact", "Exact quantity (optional)", { inputMode: "numeric", placeholder: "e.g. 12,000", maxLength: 12 })}</>)}
        {group("Box dimensions (cm)", <><div className={`grid grid-cols-3 gap-2 ${e.sizeUnknown ? "opacity-50" : ""}`}>{(["length", "width", "height"] as const).map(k => <div key={k}><label htmlFor={`v2-${k}`} className="mb-1 block text-xs capitalize text-muted-foreground">{k}</label><Input id={`v2-${k}`} disabled={e.sizeUnknown} inputMode="decimal" maxLength={7} placeholder="cm" value={e[k]} onChange={ev => set(k, ev.target.value)} className="h-11 rounded-lg text-base" /></div>)}</div>
          <button type="button" aria-pressed={e.sizeUnknown} onClick={() => set("sizeUnknown", !e.sizeUnknown)} className={chip(e.sizeUnknown)}>{e.sizeUnknown && <Check className="h-3.5 w-3.5" />}I don’t know yet</button></>)}
        {group("Material preference", <>{single("material", materials)}{e.material === "Other" && text("materialOther", "Which material?", { maxLength: 120 })}</>)}
        {needsWall(e.boxTypes) && group("Board strength (corrugated wall)", single("wall", WALLS))}
      </>}
      {step === 2 && <>
        <div className="grid gap-4 sm:grid-cols-2">
          {text("brand", "Brand / company name (optional)", { autoComplete: "organization", maxLength: 120 })}
          <div><label htmlFor="v2-phone" className="mb-1.5 block text-sm font-semibold">WhatsApp number</label><div className="flex h-11 items-center overflow-hidden rounded-lg border border-input bg-card focus-within:ring-2 focus-within:ring-ring"><span className="border-r border-border px-3 text-base text-muted-foreground">+91</span><Input id="v2-phone" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={16} value={e.phone} onChange={ev => set("phone", ev.target.value)} placeholder="98765 43210" className="h-11 rounded-none border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0" /></div><p className="mt-1 text-xs text-muted-foreground">Quotes are shared on WhatsApp. No spam.</p></div>
          {text("pincode", "Delivery city / PIN code (optional)", { inputMode: "numeric", maxLength: 6, placeholder: "e.g. 400001", autoComplete: "postal-code" })}
        </div>
        {text("productDetails", "Anything else on finishing? (optional)", { placeholder: "e.g. matte lamination, gold foil, window patch", maxLength: 300 })}
        <div className="rounded-xl border border-border bg-muted/30 p-4"><div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-semibold">Your project summary</h3><button type="button" className="text-sm text-primary hover:underline" onClick={() => setStep(1)}>Edit</button></div>
          <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">{enquirySummary(e).map(([k, v]) => <div key={k} className="min-w-0"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="break-words font-medium">{v}</dd></div>)}</dl>
          <p className="mt-3 text-xs text-muted-foreground">Anything left blank, our team will confirm with you.</p></div>
      </>}
    </fieldset>
    {error && <p role="alert" className="px-4 pb-4 text-sm text-destructive sm:px-7">{error}</p>}
    <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t border-border bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-7">{step > 0 ? <Button type="button" variant="ghost" disabled={busy} className="h-12 rounded-full px-3" onClick={() => { setStep(s => s - 1); setError(""); }}><ArrowLeft />Back</Button> : <span className="text-xs text-muted-foreground">Free · No commission</span>}<Button type="submit" disabled={busy} className="h-12 rounded-full px-5 text-sm font-semibold">{busy ? <Loader2 className="animate-spin" /> : <>{["Continue to project details", "Continue to contact", "Submit my enquiry"][step]}<ArrowRight /></>}</Button></div>
  </form>;
}
