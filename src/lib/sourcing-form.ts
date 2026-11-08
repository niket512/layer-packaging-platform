import { sourcingSubmission } from "./sourcing";
import type { SourcingBriefField } from "../../supabase/functions/_shared/sourcing-intake";

export const FORM_FORMATS = {
  boxes: ["Shipping box", "Mailer box", "Product box", "Die-cut box", "Gift box", "Not sure"],
  pouches: ["Stand-up pouch", "Flat pouch", "Flat-bottom pouch", "Spout pouch", "Sachet / stick pack", "Not sure"],
};
export type FormFamily = keyof typeof FORM_FORMATS;
export function formBrief(family: FormFamily, values: Record<string, string>): SourcingBriefField[] {
  return Object.entries({ ...values, format: `${family === "boxes" ? "Boxes" : "Flexible pouches"}${values.format ? ` — ${values.format}` : ""}` })
    .filter(([, value]) => value.trim())
    .map(([topic, value]) => ({ topic, value: value.trim(), source: "buyer" as const }));
}
export function formSubmission(brief: SourcingBriefField[], phone: string, notes: string, images: string[]) {
  return sourcingSubmission([{ query: ["Guided packaging request", notes.trim()].filter(Boolean).join("\n"), matches: [], images }], phone, undefined, brief);
}