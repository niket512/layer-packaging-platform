import type { SourcingBriefField } from "../../supabase/functions/_shared/sourcing-intake";
import { indianMobile } from "./sourcing-form";

export type BoxType = "corrugated" | "mailer" | "product" | "rigid" | "diecut" | "gift" | "unsure";
export const BOX_TYPES: { id: BoxType; label: string; description: string }[] = [
  { id: "corrugated", label: "Corrugated shipping box", description: "Strong outer boxes for shipping and storage" },
  { id: "mailer", label: "Mailer box", description: "Self-locking e-commerce boxes for unboxing" },
  { id: "product", label: "Product box / Folding carton", description: "Printed retail cartons for shelves" },
  { id: "rigid", label: "Rigid box", description: "Premium boxes with a luxury feel" },
  { id: "diecut", label: "Die-cut box", description: "Custom shapes, windows and structures" },
  { id: "gift", label: "Gift box", description: "Hampers and gifting with inserts" },
  { id: "unsure", label: "Not sure? Help me choose", description: "We’ll suggest the right box" },
];
export const PRODUCT_CATEGORIES = ["Beauty & skincare", "Cosmetics & makeup", "Haircare", "Perfumes & fragrances", "Food & snacks", "Chocolates & confectionery", "Dry fruits & nuts", "Bakery & sweets", "Health & wellness", "Pharmaceuticals", "Apparel & fashion", "Footwear", "Jewellery & accessories", "Electronics & gadgets", "Home & lifestyle", "Gifts & hampers", "Subscription boxes", "Other"];
export const QUANTITY_BANDS = ["100–499", "500–999", "1,000–4,999", "5,000–9,999", "10,000–24,999", "25,000+", "Not decided yet"];
export const PRINTING = ["Full-colour printing", "Single-colour printing", "No printing", "Not sure"];
export const TIMELINES = ["Urgently / within 1 week", "Within 2–4 weeks", "Within 1–2 months", "Planning for later", "Not decided"];
export const WALLS = ["3-ply", "5-ply", "7-ply", "Not sure"];

const MATERIALS: Record<BoxType, string[]> = {
  corrugated: ["Corrugated board", "Kraft / recycled board"],
  mailer: ["Corrugated board", "Kraft / recycled board"],
  product: ["Duplex / folding carton board", "Kraft / recycled board"],
  rigid: ["Rigid board"],
  gift: ["Rigid board", "Duplex / folding carton board"],
  diecut: ["Duplex / folding carton board", "Kraft / recycled board", "Corrugated board"],
  unsure: ["Kraft / recycled board", "Duplex / folding carton board", "Rigid board", "Corrugated board"],
};
const PREMIUM = ["Foil stamping", "Embossing", "Debossing", "Matte lamination", "Gloss lamination", "Soft-touch finish", "Spot UV"];
const FINISHES: Record<BoxType, string[]> = {
  corrugated: ["Matte lamination", "Gloss lamination", "Custom inserts", "Partitions"],
  mailer: ["Matte lamination", "Gloss lamination", "Spot UV", "Foil stamping", "Custom inserts"],
  product: PREMIUM,
  rigid: [...PREMIUM, "Custom inserts", "Partitions", "Magnetic closure"],
  gift: [...PREMIUM, "Custom inserts", "Partitions", "Magnetic closure"],
  diecut: ["Matte lamination", "Gloss lamination", "Spot UV", "Foil stamping", "Custom inserts"],
  unsure: [...PREMIUM, "Custom inserts", "Partitions", "Magnetic closure"],
};
const ALL_MATERIALS = ["Kraft / recycled board", "Duplex / folding carton board", "Rigid board", "Corrugated board"];
const ALL_FINISHES = [...PREMIUM, "Custom inserts", "Partitions", "Magnetic closure"];
const relevant = (types: BoxType[], map: Record<BoxType, string[]>, order: string[]) => {
  const picked = new Set((types.length ? types : ["unsure" as BoxType]).flatMap(t => map[t]));
  return order.filter(o => picked.has(o));
};
export const materialOptions = (types: BoxType[]) => [...relevant(types, MATERIALS, ALL_MATERIALS), "Not sure — recommend for me", "Other"];
export const finishOptions = (types: BoxType[]) => [...relevant(types, FINISHES, ALL_FINISHES), "Other", "Not sure"];
export const needsWall = (types: BoxType[]) => types.some(t => t === "corrugated" || t === "mailer");

export type BoxEnquiry = {
  boxTypes: BoxType[]; products: string[]; productOther: string; productDetails: string;
  quantityBand: string; quantityExact: string; length: string; width: string; height: string; sizeUnknown: boolean;
  material: string; materialOther: string; wall: string; printing: string; finishes: string[]; finishOther: string;
  pincode: string; timeline: string; name: string; brand: string; phone: string; email: string;
};
export const emptyEnquiry = (): BoxEnquiry => ({ boxTypes: [], products: [], productOther: "", productDetails: "", quantityBand: "", quantityExact: "", length: "", width: "", height: "", sizeUnknown: false, material: "", materialOther: "", wall: "", printing: "", finishes: [], finishOther: "", pincode: "", timeline: "", name: "", brand: "", phone: "", email: "" });

/** Drops material/finish choices that no longer apply after box types change. */
export function pruneForTypes(e: BoxEnquiry): BoxEnquiry {
  const materials = materialOptions(e.boxTypes), finishes = finishOptions(e.boxTypes);
  return { ...e, material: materials.includes(e.material) ? e.material : "", finishes: e.finishes.filter(f => finishes.includes(f)), wall: needsWall(e.boxTypes) ? e.wall : "" };
}
export const validPincode = (pin: string) => /^[1-9]\d{5}$/.test(pin.trim());
export const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) && email.trim().length <= 255;
const dim = (v: string) => /^\d{1,4}(\.\d{1,2})?$/.test(v.trim()) && Number(v) > 0;

export function stepErrors(e: BoxEnquiry, step: number): string | null {
  if (step === 0 && !e.boxTypes.length) return "Choose at least one box type, or pick “Not sure? Help me choose”.";
  if (step === 1) {
    if (e.quantityExact.trim() && !/^\d{1,8}$/.test(e.quantityExact.replace(/[,\s]/g, ""))) return "Enter the exact quantity as a number, e.g. 5000.";
    if (!e.sizeUnknown && [e.length, e.width, e.height].some(v => v.trim()) && ![e.length, e.width, e.height].every(dim)) return "Enter length, width and height in cm, or choose “I don’t know yet”.";
    if (e.pincode.trim() && !validPincode(e.pincode)) return "Enter a 6-digit Indian PIN code, e.g. 400001.";
  }
  if (step === 2) {
    if (!e.name.trim()) return "Please add your name.";
    if (!indianMobile(e.phone)) return "Enter a 10-digit Indian WhatsApp number, e.g. 98765 43210.";
    if (e.email.trim() && !validEmail(e.email)) return "Check your email address, or leave it blank.";
  }
  return null;
}
const label = (id: BoxType) => BOX_TYPES.find(b => b.id === id)?.label ?? id;
export function enquirySummary(e: BoxEnquiry): [string, string][] {
  const products = e.products.map(p => p === "Other" && e.productOther.trim() ? `Other: ${e.productOther.trim()}` : p);
  const qty = [e.quantityExact.trim() && `${e.quantityExact.trim()} boxes`, e.quantityBand].filter(Boolean).join(" · ");
  const size = e.sizeUnknown ? "Not decided yet" : [e.length, e.width, e.height].every(dim) ? `${e.length} × ${e.width} × ${e.height} cm` : "";
  const material = e.material === "Other" && e.materialOther.trim() ? `Other: ${e.materialOther.trim()}` : e.material;
  const finishes = e.finishes.map(f => f === "Other" && e.finishOther.trim() ? `Other: ${e.finishOther.trim()}` : f);
  return ([
    ["Box type", e.boxTypes.map(label).join(", ")], ["Product inside", products.join(", ")], ["Product details", e.productDetails.trim()],
    ["Quantity", qty], ["Dimensions (L × W × H)", size], ["Material", material], ["Corrugated wall", e.wall], ["Printing", e.printing],
    ["Finishes & customisation", finishes.join(", ")], ["Delivery PIN code", e.pincode.trim()], ["Timeline", e.timeline],
  ] as [string, string][]).filter(([, v]) => v);
}
export function enquiryBrief(e: BoxEnquiry): SourcingBriefField[] {
  const s = Object.fromEntries(enquirySummary(e));
  const map: [string, string | undefined][] = [["format", s["Box type"] && `Boxes — ${s["Box type"]}`], ["product", [s["Product inside"], s["Product details"]].filter(Boolean).join(" — ")], ["quantity", s.Quantity], ["size", s["Dimensions (L × W × H)"]], ["material", s.Material], ["wall", s["Corrugated wall"]], ["printing", s.Printing], ["customisation", s["Finishes & customisation"]], ["delivery", s["Delivery PIN code"] && `PIN ${s["Delivery PIN code"]}`]];
  return map.filter((m): m is [string, string] => Boolean(m[1])).map(([topic, value]) => ({ topic, value, source: "buyer" as const }));
}
export function enquiryDetails(e: BoxEnquiry, variant: string) {
  return { form_variant: variant, box_types: e.boxTypes, products: e.products, product_other: e.productOther.trim() || null, quantity_band: e.quantityBand || null, quantity_exact: e.quantityExact.replace(/[,\s]/g, "") ? Number(e.quantityExact.replace(/[,\s]/g, "")) : null, dimensions_cm: !e.sizeUnknown && [e.length, e.width, e.height].every(dim) ? [e.length, e.width, e.height].map(Number) : null, size_unknown: e.sizeUnknown, material: e.material || null, wall: e.wall || null, printing: e.printing || null, finishes: e.finishes, pincode: e.pincode.trim() || null, timeline: e.timeline || null, name: e.name.trim().slice(0, 120), brand: e.brand.trim().slice(0, 120) || null, email: e.email.trim().slice(0, 255) || null };
}
export function enquiryText(e: BoxEnquiry) {
  return ["Premium box enquiry (new form)", ...enquirySummary(e).map(([k, v]) => `${k}: ${v}`), `Name: ${e.name.trim()}`, e.brand.trim() && `Brand: ${e.brand.trim()}`, e.email.trim() && `Email: ${e.email.trim()}`].filter(Boolean).join("\n");
}

export type FormVariant = "classic" | "v2";
/** Sticky 50/50 split; ?form=v2 or ?form=classic forces a version (also sticky). */
export function formVariant(search: string, storage: Pick<Storage, "getItem" | "setItem"> | null, random = Math.random): FormVariant {
  const forced = new URLSearchParams(search).get("form");
  const KEY = "snaplogo.form.variant";
  let v: FormVariant | null = forced === "v2" || forced === "classic" ? forced : null;
  try { if (!v) { const saved = storage?.getItem(KEY); v = saved === "v2" || saved === "classic" ? saved : null; } } catch { /* ignore */ }
  v ??= random() < 0.5 ? "v2" : "classic";
  try { storage?.setItem(KEY, v); } catch { /* ignore */ }
  return v;
}
