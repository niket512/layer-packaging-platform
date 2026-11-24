import { sourcingSubmission } from "./sourcing";
import type { SourcingBriefField } from "../../supabase/functions/_shared/sourcing-intake";
import type { PackagingDesign } from "@/components/sourcing/packaging-catalogue";

export const FORM_FORMATS = {
  boxes: ["Shipping box", "Mailer box", "Product box", "Die-cut box", "Gift box", "Not sure, help me choose"],
  pouches: ["Stand-up pouch", "Flat pouch", "Flat-bottom pouch", "Spout pouch", "Sachet / stick pack", "Not sure, help me choose"],
};
export type FormFamily = keyof typeof FORM_FORMATS;
export const FORM_STEPS = [
  { label: "Packaging", topics: ["format"] },
  { label: "WhatsApp", topics: ["phone"] },
  { label: "Details", topics: ["quantity", "size", "printing", "material", "wall", "closure", "finishing", "delivery", "notes"] },
] as const;
export const NOT_SURE_SIZE = "Not sure about dimensions";
export const SIZE_SUGGESTIONS: Record<FormFamily, string[]> = {
  boxes: ["Small · 15 × 10 × 5 cm", "Medium · 25 × 20 × 10 cm", "Large · 35 × 25 × 15 cm", NOT_SURE_SIZE],
  pouches: ["100 g", "250 g", "500 g", "1 kg", NOT_SURE_SIZE],
};
/** Indian mobile: 10 digits starting 6–9, optionally prefixed by +91, 91 or 0. */
export function indianMobile(phone: string): string | null {
  if (!/^[+\d\s()-]+$/.test(phone.trim())) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? `+91 ${digits}` : null;
}
export function applyDesignToForm(family: FormFamily, values: Record<string, string>, designs: PackagingDesign[], step: number) {
  const prefill = designFormPrefill(designs);
  if (!prefill) return null;
  const retained = Object.fromEntries(Object.entries(values).filter(([key, value]) => value.trim() && (family === prefill.family || !["format", "wall", "closure", "material"].includes(key))));
  const nextValues = { ...retained, ...prefill.values };
  const nextStep = nextValues.format ? (step === 0 ? 1 : Math.min(step, 2)) : 0;
  return { family: prefill.family, values: nextValues, step: nextStep };
}
export function designFormPrefill(designs: PackagingDesign[]): { family: FormFamily; values: Record<string, string> } | null {
  const first = designs[0];
  if (!first) return null;
  const sameFamily = designs.filter(d => d.family === first.family);
  const unique = (key: "style" | "printing" | "material" | "features") => [...new Set(sameFamily.flatMap(d => d.attributes[key] ?? []))];
  const styles: Record<string, string> = { "Regular Slotted Carton (RSC)": "Shipping box", Mailer: "Mailer box", "Die-cut": "Die-cut box", "Stand-up": "Stand-up pouch", Flat: "Flat pouch", "Flat-bottom": "Flat-bottom pouch", Spout: "Spout pouch", Sachet: "Sachet / stick pack", "Stick Pack": "Sachet / stick pack" };
  const values: Record<string, string> = {};
  const style = unique("style");
  if (style.length === 1 && styles[style[0]]) values.format = styles[style[0]];
  const printing = unique("printing");
  const printOptions: Record<string, string> = { Plain: "Plain", "Logo printed": "Logo only", Multicolour: "Multicolour" };
  if (printing.length === 1 && printOptions[printing[0]]) values.printing = printOptions[printing[0]];
  const closures = unique("features").filter(feature => ["Zipper", "Spout", "Heat seal"].includes(feature));
  if (first.family === "pouches" && closures.length === 1) values.closure = closures[0];
  return { family: first.family, values };
}
export function formBrief(family: FormFamily, values: Record<string, string>): SourcingBriefField[] {
  return Object.entries({ ...values, format: `${family === "boxes" ? "Boxes" : "Flexible pouches"}${values.format ? ` — ${values.format}` : ""}` })
    .filter(([, value]) => value.trim())
    .map(([topic, value]) => ({ topic, value: value.trim(), source: "buyer" as const }));
}
export function formSubmission(brief: SourcingBriefField[], phone: string, notes: string, images: string[]) {
  return sourcingSubmission([{ query: ["Guided packaging request", notes.trim()].filter(Boolean).join("\n"), matches: [], images }], phone, undefined, brief);
}