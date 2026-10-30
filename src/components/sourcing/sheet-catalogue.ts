import rows from "@/data/catalogue-sheet.json";
import type { PackagingDesign } from "./packaging-catalogue";

export type SheetRow = { id: string; f: "boxes" | "pouches"; c: string; l2: string; l3: string; n: string; d?: string; t?: string[]; dim?: string; ply?: string; img: string;
  /** Read from the product photo by AI; preferred over keyword rules when present. */
  ai?: { style?: string; printing?: string; category?: string; useCase?: string; features?: string[]; description?: string } };

const BOX_CATEGORY: [string, string[]][] = [
  ["1.1.1", ["mailer"]], ["1.1.2", ["shipping"]], ["1.1.3", ["mailer", "die-cut"]], ["1.1.4", ["subscription", "mailer"]],
  ["1.2", ["product"]], ["1.3", ["shipping"]], ["1.4", ["food"]], ["1.5", ["specialty"]],
  ["1.6.3", ["gift"]], ["1.6.4", ["die-cut"]], ["1.6", ["specialty"]],
];
const POUCH_CATEGORY: [string, string[]][] = [["2.1", ["stand-up"]], ["2.2.3", ["pillow"]], ["2.2", ["flat"]], ["2.4", ["spout"]], ["2.5", ["barrier"]]];
const firstMatch = (table: [string, string[]][], id: string) => table.find(([prefix]) => id === prefix || id.startsWith(prefix + "."))?.[1] ?? [];

function boxStyle(c: string) {
  if (c === "1.1.1" || c === "1.1.4") return "Mailer";
  if (c === "1.1.2" || c.startsWith("1.3.4")) return "Regular Slotted Carton (RSC)";
  if (c === "1.1.3" || c === "1.6.4") return "Die-cut";
  if (c === "1.3.1") return "Telescope";
  return "Other";
}
// Printing only from words in the source tags; nothing inferred.
function printing(tags: string[]) {
  if (tags.includes("unprinted-stock")) return "Plain";
  if (tags.includes("full-colour") || tags.includes("digital-print")) return "Multicolour";
  if (tags.includes("custom-logo")) return "Logo printed";
  return undefined;
}
function pouchStyle(c: string) {
  return c.startsWith("2.1") ? "Stand-up" : c === "2.2.3" ? "Pillow" : c.startsWith("2.2") ? "Flat" : c.startsWith("2.4") ? "Spout" : "Other";
}
function application(tags: string[]) {
  const has = (...t: string[]) => t.some(x => tags.includes(x));
  if (has("coffee-tea")) return "Coffee & Tea";
  if (has("snacks", "spices", "dry-fruits-nuts", "food", "bakery")) return "Food & Snacks";
  if (has("cosmetics")) return "Cosmetics";
  if (has("personal-care")) return "Personal Care";
  if (has("nutraceuticals", "herbal")) return "Supplements";
  if (has("pet-products", "pet-food")) return "Pet Products";
  return undefined;
}

export function sheetDesign(r: SheetRow): PackagingDesign {
  const tags = r.t ?? [];
  const ai = r.ai ?? {};
  const print = ai.printing ?? printing(tags);
  const isBox = r.f === "boxes";
  const style = ai.style ?? (isBox ? boxStyle(r.c) : pouchStyle(r.c));
  const base = firstMatch(isBox ? BOX_CATEGORY : POUCH_CATEGORY, r.c);
  const pouchCat = ({ "Stand-up": "stand-up", Flat: "flat", Pillow: "pillow", "Flat-bottom": "flat-bottom", Spout: "spout", Sachet: "sachet-stick", "Stick Pack": "sachet-stick" } as Record<string, string>)[style];
  const categories = [...new Set([...(isBox ? (ai.category ? [ai.category] : base) : pouchCat ? [pouchCat] : base), ...(isBox && style === "Die-cut" ? ["die-cut"] : []), ...(isBox && style === "Mailer" ? ["mailer"] : []), ...(isBox && print && print !== "Plain" ? ["printed"] : [])])];
  const app = isBox ? undefined : ai.useCase ?? application(tags);
  const features = ai.features?.length ? ai.features : tags.includes("zipper") ? ["Zipper"] : [];
  return {
    id: r.id, name: r.n, family: r.f, categories, image: r.img, illustrative: false,
    description: ai.description || r.d || `${r.l3} — ${r.l2.toLowerCase()}.`,
    attributes: isBox
      ? { style: [style], ...(print ? { printing: [print] } : {}) }
      : { style: [style], ...(app ? { useCase: [app] } : {}), ...(features.length ? { features } : {}) },
    details: [["Type", r.l3], ...(r.dim ? [["Size", r.dim]] : []), ...(r.ply ? [["Ply", r.ply]] : []), ...(tags.length ? [["Tags", tags.join(", ")]] : [])] as [string, string][],
  };
}

export const SHEET_DESIGNS: PackagingDesign[] = (rows as SheetRow[]).map(sheetDesign);
