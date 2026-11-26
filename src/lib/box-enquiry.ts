import type { SourcingBriefField } from "@/lib/sourcing-intake";
import { indianMobile } from "./sourcing-form";

export type BoxType = "corrugated" | "mailer" | "product" | "rigid" | "display" | "diecut" | "gift" | "unsure";
export const BOX_TYPES: { id: BoxType; label: string; description: string; use?: string }[] = [
  { id: "corrugated", use: "Shipping", label: "Corrugated shipping box", description: "Strong outer boxes for shipping and storage" },
  { id: "mailer", use: "D2C unboxing", label: "Mailer box", description: "Self-locking e-commerce boxes for unboxing" },
  { id: "product", use: "Retail shelf", label: "Product Box", description: "Printed retail cartons for shelves" },
  { id: "rigid", use: "Luxury & gifting", label: "Rigid box", description: "Premium boxes with a luxury feel, incl. magnetic closure" },
  { id: "display", use: "Counter retail", label: "Display / counter box", description: "Retail counter and shelf-ready displays" },
  { id: "diecut", use: "Shapes & windows", label: "Die-cut box", description: "Custom shapes, windows and structures" },
  { id: "gift", use: "Hampers", label: "Gift box", description: "Hampers and gifting with inserts" },
  { id: "unsure", label: "Not sure — help me choose", description: "We’ll suggest the right box" },
];
export const PRODUCT_CATEGORIES = ["Beauty & skincare", "Cosmetics & makeup", "Haircare", "Perfumes & fragrances", "Food & snacks", "Chocolates & confectionery", "Dry fruits & nuts", "Bakery & sweets", "Health & wellness", "Pharmaceuticals", "Apparel & fashion", "Footwear", "Jewellery & accessories", "Electronics & gadgets", "Home & lifestyle", "Gifts & hampers", "Subscription boxes", "Other"];
export const WALLS = ["3-ply", "5-ply", "7-ply", "Not sure"];

const MATERIALS: Record<BoxType, string[]> = {
  corrugated: ["Corrugated board", "Kraft / recycled board"],
  mailer: ["Corrugated board", "Kraft / recycled board"],
  product: ["Duplex / folding carton board", "Kraft / recycled board"],
  rigid: ["Rigid board"],
  display: ["Corrugated board", "Duplex / folding carton board"],
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
export const needsWall = (types: BoxType[]) => types.some(t => t === "corrugated" || t === "mailer" || t === "display");

export type BoxEnquiry = {
  boxTypes: BoxType[]; products: string[]; productOther: string;
  quantityExact: string;
  length: string; width: string; height: string; sizeInput?: string; sizeUnknown: boolean; unit?: "cm" | "in";
  material: string; materialOther: string; wall: string;
  pincode: string; brand: string; phone: string;
};
export const emptyEnquiry = (): BoxEnquiry => ({ boxTypes: [], products: [], productOther: "", quantityExact: "", length: "", width: "", height: "", sizeUnknown: false, unit: "in", material: "", materialOther: "", wall: "", pincode: "", brand: "", phone: "" });

/** Normalise unsent drafts only; historical saved briefs remain unchanged. */
export function singleChoiceEnquiry(e: BoxEnquiry): BoxEnquiry {
  // Drafts saved before a style was retired must not submit a style the form no longer offers.
  const known = e.boxTypes.filter(t => BOX_TYPES.some(b => b.id === t));
  return pruneForTypes({ ...e, boxTypes: known.slice(0, 1), products: e.products.slice(0, 1) });
}

/** Drops material choices that no longer apply after box types change. */
export function pruneForTypes(e: BoxEnquiry): BoxEnquiry {
  const materials = materialOptions(e.boxTypes);
  return { ...e, material: materials.includes(e.material) ? e.material : "", wall: needsWall(e.boxTypes) ? e.wall : "" };
}
export const validPincode = (pin: string) => /^[1-9]\d{5}$/.test(pin.trim());
const dim = (v: string) => /^\d{1,4}(\.\d{1,2})?$/.test(v.trim()) && Number(v) > 0;
const qty = (v: string) => /^\d{1,7}$/.test(v.replace(/[,\s]/g, ""));

export function parseBoxSize(raw: string): Pick<BoxEnquiry, "length" | "width" | "height"> | null {
  const parts = raw.trim().split(/\s*[x×*,]\s*|\s+/i);
  if (parts.length !== 3 || !parts.every(dim)) return null;
  const [length = "", width = "", height = ""] = parts;
  return { length, width, height };
}

export type StepError = { field: "boxTypes" | "phone" | "pincode" | "quantityExact" | "size"; message: string };

/** The first problem on a step, tagged with the field the message belongs to. */
export function stepFieldError(e: BoxEnquiry, step: number): StepError | null {
  if (step === 0 && e.boxTypes.length !== 1) return { field: "boxTypes", message: "Choose one box type, or pick “Not sure — help me choose”." };
  if (step === 1) {
    if (!qty(e.quantityExact)) return { field: "quantityExact", message: "Enter the number of boxes you need, e.g. 12000." };
    if (!e.sizeUnknown && ((e.sizeInput?.trim() && !parseBoxSize(e.sizeInput)) || ([e.length, e.width, e.height].some(v => v.trim()) && ![e.length, e.width, e.height].every(dim)))) return { field: "size", message: "Enter length × breadth × height, e.g. 12 × 8 × 6, or leave box size blank." };
  }
  if (step === 2) {
    if (!indianMobile(e.phone)) return { field: "phone", message: "Enter a 10-digit Indian WhatsApp number, e.g. 98765 43210." };
    if (e.pincode.trim() && !validPincode(e.pincode)) return { field: "pincode", message: "Enter a 6-digit Indian PIN code, e.g. 400001." };
  }
  return null;
}

export function stepErrors(e: BoxEnquiry, step: number): string | null {
  return stepFieldError(e, step)?.message ?? null;
}
const label = (id: BoxType) => BOX_TYPES.find(b => b.id === id)?.label ?? id;
export function enquirySummary(e: BoxEnquiry): [string, string][] {
  const products = e.products.map(p => p === "Other" && e.productOther.trim() ? `Other: ${e.productOther.trim()}` : p);
  const size = e.sizeUnknown ? "Not decided yet" : [e.length, e.width, e.height].every(dim) ? `${e.length} × ${e.width} × ${e.height} ${e.unit === "cm" ? "cm" : "in"}` : "";
  const material = e.material === "Other" && e.materialOther.trim() ? `Other: ${e.materialOther.trim()}` : e.material;
  return ([
    ["Box type", e.boxTypes.map(label).join(", ")], ["Product inside", products.join(", ")],
    ["Quantity", e.quantityExact.trim()],
    ["Dimensions (L × W × H)", size], ["Material", material], ["Corrugated wall", e.wall],
    ["Delivery PIN code", e.pincode.trim()],
  ] as [string, string][]).filter(([, v]) => v);
}
export function enquiryBrief(e: BoxEnquiry): SourcingBriefField[] {
  const s = Object.fromEntries(enquirySummary(e));
  const map: [string, string | undefined][] = [["format", s["Box type"] && `Boxes — ${s["Box type"]}`], ["product", s["Product inside"]], ["quantity", s["Quantity"]], ["size", s["Dimensions (L × W × H)"]], ["material", s["Material"]], ["wall", s["Corrugated wall"]], ["delivery", s["Delivery PIN code"] && `PIN ${s["Delivery PIN code"]}`]];
  return map.filter((m): m is [string, string] => Boolean(m[1])).map(([topic, value]) => ({ topic, value, source: "buyer" as const }));
}
export function enquiryDetails(e: BoxEnquiry, variant: string, designPhotos = 0) {
  return { form_variant: variant, box_types: e.boxTypes, products: e.products, product_other: e.productOther.trim() || null, quantity_exact: e.quantityExact.trim() || null, design_photos: designPhotos > 0 ? designPhotos : null, dimensions_cm: !e.sizeUnknown && [e.length, e.width, e.height].every(dim) ? [e.length, e.width, e.height].map(v => e.unit === "cm" ? Number(v) : Math.round(Number(v) * 2.54 * 10) / 10) : null, dimensions_unit_entered: e.unit === "cm" ? "cm" : "in", size_unknown: e.sizeUnknown, material: e.material || null, wall: e.wall || null, pincode: e.pincode.trim() || null, brand: e.brand.trim().slice(0, 120) || null };
}
export function enquiryText(e: BoxEnquiry, designPhotos = 0) {
  return ["Premium box enquiry (new form)", ...enquirySummary(e).map(([k, v]) => `${k}: ${v}`), designPhotos > 0 && `Design reference: ${designPhotos} photo${designPhotos > 1 ? "s" : ""} attached`, e.brand.trim() && `Brand: ${e.brand.trim()}`].filter(Boolean).join("\n");
}

export type FormVariant = "classic" | "v2";
/** New form for everyone; only an explicit ?form=classic shows the old form, and it does not stick. */
export function formVariant(search: string, storage: Pick<Storage, "getItem" | "setItem"> | null, _random = Math.random): FormVariant {
  const v: FormVariant = new URLSearchParams(search).get("form") === "classic" ? "classic" : "v2";
  try { storage?.setItem("snaplogo.form.variant", "v2"); } catch { /* ignore */ }
  return v;
}
