import { DESIGN_SPECS } from "./corrugated-catalogue";
import kraftShip from "@/assets/design-ship-kraft.jpg";
import whiteMailer from "@/assets/design-mailer-white.jpg";
import printedKraft from "@/assets/design-printed-kraft.jpg";
import tealMailer from "@/assets/design-mailer-teal.jpg";
import blackMailer from "@/assets/design-mailer-black.jpg";
import dieCut from "@/assets/design-diecut-open.jpg";

export type PackagingFamily = "boxes" | "pouches";
export type AttributeKey = "style" | "printing" | "material" | "useCase" | "features" | "finish" | "quantity";
export type PackagingDesign = {
  id: string; name: string; family: PackagingFamily; categories: string[];
  image: string; description: string; illustrative: boolean;
  attributes: Partial<Record<AttributeKey, string[]>>;
  details?: [string, string][];
};
export type CatalogueFilters = Record<AttributeKey, string>;
export const CLEAR_FILTERS: CatalogueFilters = { style: "all", printing: "all", material: "all", useCase: "all", features: "all", finish: "all", quantity: "all" };
export const FAMILIES: { id: PackagingFamily; label: string }[] = [
  { id: "boxes", label: "Corrugated Boxes" }, { id: "pouches", label: "Flexible Pouches" },
];
export const CATEGORIES: Record<"boxes" | "pouches", { id: string; label: string }[]> = {
  boxes: [{ id: "all", label: "All Boxes" }, { id: "shipping", label: "Shipping Boxes" }, { id: "mailer", label: "E-commerce Mailers" }, { id: "product", label: "Product Boxes" }, { id: "die-cut", label: "Die-cut Boxes" }, { id: "subscription", label: "Subscription Boxes" }, { id: "gift", label: "Gift Boxes" }, { id: "printed", label: "Printed Boxes" }, { id: "food", label: "Food & Beverage" }, { id: "specialty", label: "Specialty Boxes" }],
  pouches: [{ id: "all", label: "All Pouches" }, { id: "stand-up", label: "Stand-up Pouches" }, { id: "flat", label: "Flat Pouches" }, { id: "pillow", label: "Pillow Pouches" }, { id: "flat-bottom", label: "Flat-bottom Pouches" }, { id: "spout", label: "Spout Pouches" }, { id: "sachet-stick", label: "Sachets & Stick Packs" }, { id: "barrier", label: "Barrier Pouches" }],
};
export type FilterDefinition = { key: AttributeKey; label: string; options: string[] };
export const PRIMARY_FILTERS: Record<"boxes" | "pouches", FilterDefinition[]> = {
  boxes: [
    { key: "style", label: "Box style", options: ["Regular Slotted Carton (RSC)", "Die-cut", "Mailer", "Telescope", "Other"] },
    { key: "printing", label: "Printing", options: ["Plain", "One-colour", "Logo printed", "Multicolour"] },
  ],
  pouches: [
    { key: "style", label: "Pouch type", options: ["Stand-up", "Flat", "Pillow", "Flat-bottom", "Spout", "Sachet", "Stick Pack"] },
    { key: "useCase", label: "Application", options: ["Food & Snacks", "Coffee & Tea", "Cosmetics", "Personal Care", "Supplements", "Pet Products", "Other"] },
  ],
};
const BOX_IMAGES: Record<string, string> = { "kraft-ship": kraftShip, "die-cut": dieCut, "logo-mailer": whiteMailer, "pattern-mailer": tealMailer, "brand-shipper": printedKraft, "premium-mailer": blackMailer };
export const BOX_DESIGNS: PackagingDesign[] = DESIGN_SPECS.map(d => ({
  id: d.id, name: d.name, family: "boxes", categories: [...d.categories, ...(d.style === "Mailer" ? ["subscription"] : []), ...(d.useCase === "Gifting" ? ["gift"] : [])],
  image: BOX_IMAGES[d.id], description: d.description, illustrative: true,
  // Visual reference attributes are not manufacturer specifications. Board and finish remain unknown.
  attributes: { style: [d.style === "RSC" ? "Regular Slotted Carton (RSC)" : d.style], printing: [d.printing === "1-colour" ? "One-colour" : d.printing === "Foil logo" ? "One-colour" : d.printing], useCase: d.style === "Mailer" ? ["E-commerce", "Subscription", ...(d.useCase === "Gifting" ? ["Gifting"] : ["Retail"])] : d.style === "RSC" ? ["Shipping", "E-commerce"] : ["Retail"] },
}));

export function browseDesigns(designs: PackagingDesign[], family: PackagingFamily, category: string, filters: CatalogueFilters, search: string, sort: string) {
  const terms = search.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const result = designs.filter(d => d.family === family && (category === "all" || d.categories.includes(category)) &&
    (Object.keys(filters) as AttributeKey[]).every(key => filters[key] === "all" || (filters[key] === "unspecified" ? !d.attributes[key]?.length : d.attributes[key]?.includes(filters[key]))) &&
    terms.every(term => [d.name, d.family === "boxes" ? "corrugated boxes" : "flexible pouches", d.description, ...d.categories, ...Object.values(d.attributes).flat()].join(" ").toLocaleLowerCase().includes(term)));
  return sort === "az" ? result.sort((a, b) => a.name.localeCompare(b.name)) : result;
}

export function selectedDesignRequirement(designs: PackagingDesign[]) {
  return `Please source ${[...new Set(designs.map(d => FAMILIES.find(f => f.id === d.family)?.label.toLowerCase()))].join(" and ")} using these design references:\n` + designs.map(d => `${d.name} [${d.id}]${Object.entries(d.attributes).length ? ` — ${Object.values(d.attributes).flat().join(", ")}` : ""}`).join("\n") + "\nPlease confirm suitability and quotation details with me.";
}