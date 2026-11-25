import type { SourcingBriefField } from "../../supabase/functions/_shared/sourcing-intake";
import { indianMobile } from "./sourcing-form";

export type BoxType = "corrugated" | "mailer" | "product" | "rigid" | "sleeve" | "gable" | "display" | "pillow" | "diecut" | "gift" | "unsure";
export const BOX_TYPES: { id: BoxType; label: string; description: string }[] = [
  { id: "corrugated", label: "Corrugated shipping box", description: "Strong outer boxes for shipping and storage" },
  { id: "mailer", label: "Mailer box", description: "Self-locking e-commerce boxes for unboxing" },
  { id: "product", label: "Product / folding carton", description: "Printed retail cartons for shelves" },
  { id: "rigid", label: "Rigid box", description: "Premium boxes with a luxury feel, incl. magnetic closure" },
  { id: "sleeve", label: "Sleeve & drawer box", description: "Sliding boxes for soaps, jewellery and more" },
  { id: "gable", label: "Gable / handle box", description: "Carry boxes with built-in handles" },
  { id: "display", label: "Display / counter box", description: "Retail counter and shelf-ready displays" },
  { id: "pillow", label: "Pillow box", description: "Curved fold boxes for small gifts and favours" },
  { id: "diecut", label: "Die-cut box", description: "Custom shapes, windows and structures" },
  { id: "gift", label: "Gift box", description: "Hampers and gifting with inserts" },
  { id: "unsure", label: "Not sure? Help me choose", description: "We’ll suggest the right box" },
];
export const PRODUCT_CATEGORIES = ["Beauty & skincare", "Cosmetics & makeup", "Haircare", "Perfumes & fragrances", "Food & snacks", "Chocolates & confectionery", "Dry fruits & nuts", "Bakery & sweets", "Health & wellness", "Pharmaceuticals", "Apparel & fashion", "Footwear", "Jewellery & accessories", "Electronics & gadgets", "Home & lifestyle", "Gifts & hampers", "Subscription boxes", "Other"];
export const WALLS = ["3-ply", "5-ply", "7-ply", "Not sure"];

const MATERIALS: Record<BoxType, string[]> = {
  corrugated: ["Corrugated board", "Kraft / recycled board"],
  mailer: ["Corrugated board", "Kraft / recycled board"],
  product: ["Duplex / folding carton board", "Kraft / recycled board"],
  rigid: ["Rigid board"],
  sleeve: ["Duplex / folding carton board", "Kraft / recycled board", "Rigid board"],
  gable: ["Corrugated board", "Kraft / recycled board", "Duplex / folding carton board"],
  display: ["Corrugated board", "Duplex / folding carton board"],
  pillow: ["Duplex / folding carton board", "Kraft / recycled board"],
  gift: ["Rigid board", "Duplex / folding carton board"],
  diecut: ["Duplex / folding carton board", "Kraft / recycled board", "Corrugated board"],
  unsure: ["Kraft / recycled board", "Duplex / folding carton board", "Rigid board", "Corrugated board"],
};
const ALL_MATERIALS = ["Kraft / recycled board", "Duplex / folding carton board", "Rigid board", "Corrugated board"];
const relevant = (types: BoxType[], map: Record<BoxType, string[]>, order: string[]) => {
  const picked = new Set((types.length ? types : ["unsure" as BoxType]).flatMap(t => map[t]));
  return order.filter(o => picked.has(o));
};
export const materialOptions = (types: BoxType[]) => [...relevant(types, MATERIALS, ALL_MATERIALS), "Not sure — recommend for me", "Other"];
export const needsWall = (types: BoxType[]) => types.some(t => t === "corrugated" || t === "mailer" || t === "gable" || t === "display");

export type BoxEnquiry = {
  boxTypes: BoxType[]; products: string[]; productOther: string; productDetails: string;
  quantityExact: string;
  length: string; width: string; height: string; sizeUnknown: boolean; unit?: "cm" | "in";
  material: string; materialOther: string; wall: string;
  pincode: string; brand: string; phone: string;
};
export const emptyEnquiry = (): BoxEnquiry => ({ boxTypes: [], products: [], productOther: "", productDetails: "", quantityExact: "", length: "", width: "", height: "", sizeUnknown: false, material: "", materialOther: "", wall: "", pincode: "", brand: "", phone: "" });

/** Drops material choices that no longer apply after box types change. */
export function pruneForTypes(e: BoxEnquiry): BoxEnquiry {
  const materials = materialOptions(e.boxTypes);
  return { ...e, material: materials.includes(e.material) ? e.material : "", wall: needsWall(e.boxTypes) ? e.wall : "" };
}
export const validPincode = (pin: string) => /^[1-9]\d{5}$/.test(pin.trim());
const dim = (v: string) => /^\d{1,4}(\.\d{1,2})?$/.test(v.trim()) && Number(v) > 0;
const qty = (v: string) => /^\d{1,7}$/.test(v.replace(/[,\s]/g, ""));

export function stepErrors(e: BoxEnquiry, step: number): string | null {
  if (step === 0 && !e.boxTypes.length) return "Choose at least one box type, or pick “Not sure? Help me choose”.";
  if (step === 1) {
    if (!qty(e.quantityExact)) return "Enter the number of boxes you need, e.g. 12000.";
    if (!e.sizeUnknown && [e.length, e.width, e.height].some(v => v.trim()) && ![e.length, e.width, e.height].every(dim)) return "Enter length, width and height, or tap “Don’t know yet”.";
  }
  if (step === 2) {
    if (!indianMobile(e.phone)) return "Enter a 10-digit Indian WhatsApp number, e.g. 98765 43210.";
    if (e.pincode.trim() && !validPincode(e.pincode)) return "Enter a 6-digit Indian PIN code, e.g. 400001.";
  }
  return null;
}
const label = (id: BoxType) => BOX_TYPES.find(b => b.id === id)?.label ?? id;
export function enquirySummary(e: BoxEnquiry): [string, string][] {
  const products = e.products.map(p => p === "Other" && e.productOther.trim() ? `Other: ${e.productOther.trim()}` : p);
  const size = e.sizeUnknown ? "Not decided yet" : [e.length, e.width, e.height].every(dim) ? `${e.length} × ${e.width} × ${e.height} ${e.unit === "in" ? "in" : "cm"}` : "";
  const material = e.material === "Other" && e.materialOther.trim() ? `Other: ${e.materialOther.trim()}` : e.material;
  return ([
    ["Box type", e.boxTypes.map(label).join(", ")], ["Product inside", products.join(", ")],
    ["Quantity", e.quantityExact.trim()],
    ["Dimensions (L × W × H)", size], ["Material", material], ["Corrugated wall", e.wall],
    ["Delivery PIN code", e.pincode.trim()], ["Anything else on finishing", e.productDetails.trim()],
  ] as [string, string][]).filter(([, v]) => v);
}
export function enquiryBrief(e: BoxEnquiry): SourcingBriefField[] {
  const s = Object.fromEntries(enquirySummary(e));
  const map: [string, string | undefined][] = [["format", s["Box type"] && `Boxes — ${s["Box type"]}`], ["product", s["Product inside"]], ["quantity", s.Quantity], ["size", s["Dimensions (L × W × H)"]], ["material", s.Material], ["wall", s["Corrugated wall"]], ["delivery", s["Delivery PIN code"] && `PIN ${s["Delivery PIN code"]}`], ["customisation", s["Anything else on finishing"]]];
  return map.filter((m): m is [string, string] => Boolean(m[1])).map(([topic, value]) => ({ topic, value, source: "buyer" as const }));
}
export function enquiryDetails(e: BoxEnquiry, variant: string) {
  return { form_variant: variant, box_types: e.boxTypes, products: e.products, product_other: e.productOther.trim() || null, product_details: e.productDetails.trim() || null, quantity_exact: e.quantityExact.trim() || null, dimensions_cm: !e.sizeUnknown && [e.length, e.width, e.height].every(dim) ? [e.length, e.width, e.height].map(v => e.unit === "in" ? Math.round(Number(v) * 2.54 * 10) / 10 : Number(v)) : null, dimensions_unit_entered: e.unit === "in" ? "in" : "cm", size_unknown: e.sizeUnknown, material: e.material || null, wall: e.wall || null, pincode: e.pincode.trim() || null, brand: e.brand.trim().slice(0, 120) || null };
}
export function enquiryText(e: BoxEnquiry) {
  return ["Premium box enquiry (new form)", ...enquirySummary(e).map(([k, v]) => `${k}: ${v}`), e.brand.trim() && `Brand: ${e.brand.trim()}`].filter(Boolean).join("\n");
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
