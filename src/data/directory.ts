/**
 * Manufacturer discovery data layer.
 * Only records with listing_status "published" are shown publicly.
 * Unconfirmed facts stay null — never fill them with guesses.
 */
import corrugated from "@/assets/cat-corrugated.jpg";
import flexible from "@/assets/cat-flexible.jpg";
import bottles from "@/assets/cat-bottles.jpg";
import labels from "@/assets/cat-labels.jpg";
import paperbags from "@/assets/cat-paperbags.jpg";
import cartons from "@/assets/cat-cartons.jpg";
import courier from "@/assets/cat-courier.jpg";
import other from "@/assets/cat-other.jpg";

export const PACKAGING_CATEGORIES = [
  { key: "corrugated", label: "Corrugated Boxes", subtitle: "Shipping, e-commerce and export cartons", image: corrugated },
  { key: "flexible", label: "Flexible Packaging & Pouches", subtitle: "Stand-up pouches, sachets and roll stock", image: flexible },
  { key: "bottles", label: "Bottles & Jars", subtitle: "Plastic bottles, jars and containers", image: bottles },
  { key: "labels", label: "Labels & Stickers", subtitle: "Roll labels, sheets and product stickers", image: labels },
  { key: "paper-bags", label: "Paper Bags", subtitle: "Kraft, retail and food-delivery bags", image: paperbags },
  { key: "cartons", label: "Mono Cartons & Folding Boxes", subtitle: "Printed paperboard retail boxes", image: cartons },
  { key: "courier", label: "Courier Bags & Mailers", subtitle: "Poly mailers, envelopes and courier bags", image: courier },
  { key: "other", label: "Other Packaging", subtitle: "Food boxes, gifting and specialty formats", image: other },
] as const;
export type CategoryKey = (typeof PACKAGING_CATEGORIES)[number]["key"];

export const CUSTOMIZATION = {
  "custom-sizes": "Custom sizes",
  "custom-printing": "Custom printing",
  "material-options": "Material options",
  "finishing-options": "Finishing options",
  "custom-structures": "Custom structures",
} as const;
export type CustomizationKey = keyof typeof CUSTOMIZATION;

export const CAPABILITIES = {
  "digital-printing": "Digital printing",
  "offset-printing": "Offset printing",
  "flexo-printing": "Flexographic printing",
  "rotogravure-printing": "Rotogravure printing",
  "custom-manufacturing": "Custom manufacturing",
  "ready-made": "Ready-made packaging",
} as const;
export type CapabilityKey = keyof typeof CAPABILITIES;

export type ScopedFact = { scope: string; value: string };

export type DirectoryManufacturer = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  cover_image_url: string | null;
  description: string;
  city: string | null;
  state: string | null;
  website_url: string | null;
  packaging_categories: CategoryKey[];
  customization_capabilities: CustomizationKey[];
  /** Printing + manufacturing capabilities confirmed by the supplier's own material */
  printing_capabilities: CapabilityKey[];
  products: string[];
  minimum_order_quantities: ScopedFact[];
  lead_times: ScopedFact[];
  delivery_locations: string[] | null;
  contact_details: null; // private contact info is never exposed publicly
  listing_status: "draft" | "published";
  last_updated_at: string;
};

const records: DirectoryManufacturer[] = [
  {
    id: "evenpack",
    slug: "evenpack",
    name: "Evenpack",
    logo_url: null,
    cover_image_url: paperbags,
    description:
      "Manufactures and prints custom packaging for businesses of different sizes — ready-made packaging with branded printing as well as fully customised solutions, produced in-house in New Delhi.",
    city: "New Delhi",
    state: "Delhi",
    website_url: "https://evenpack.co/",
    packaging_categories: ["paper-bags", "corrugated", "flexible", "courier"],
    customization_capabilities: ["custom-sizes", "custom-printing", "custom-structures"],
    printing_capabilities: ["digital-printing", "custom-manufacturing", "ready-made"],
    products: [
      "Paper bags, including kraft and food-delivery bags",
      "Corrugated shipping and e-commerce boxes",
      "Stand-up pouches and other flexible packaging",
      "Courier bags, mailers and envelopes",
    ],
    minimum_order_quantities: [{ scope: "Standard digital-printing options", value: "100 units" }],
    lead_times: [
      { scope: "Stock and printed orders", value: "2–10 business days" },
      { scope: "Fully custom orders", value: "10–20 business days" },
    ],
    delivery_locations: null,
    contact_details: null,
    listing_status: "published",
    last_updated_at: "2026-10-12",
  },
  {
    id: "ragsaa-innovation",
    slug: "ragsaa-innovation",
    name: "RAGSAA Innovation",
    logo_url: null,
    cover_image_url: corrugated,
    description:
      "Customised corrugated and paper packaging based on product, quantity and budget, including e-commerce, export and food packaging.",
    city: "Jaipur",
    state: "Rajasthan",
    website_url: "https://ragsaainnovation.com/",
    packaging_categories: ["corrugated", "paper-bags", "other"],
    customization_capabilities: ["custom-printing", "custom-structures"],
    printing_capabilities: ["custom-manufacturing"],
    products: [
      "Corrugated boxes: 3-ply, 5-ply and 7-ply",
      "Printed and custom die-cut boxes",
      "E-commerce and export packaging",
      "Cake and pizza boxes",
      "Paper food packaging and bags",
    ],
    minimum_order_quantities: [],
    lead_times: [],
    delivery_locations: null,
    contact_details: null,
    listing_status: "published",
    last_updated_at: "2026-10-12",
  },
];

/** Async on purpose so the UI already handles loading/error like a real backend. */
export async function fetchPublishedManufacturers(): Promise<DirectoryManufacturer[]> {
  return records.filter((r) => r.listing_status === "published");
}

export const categoryLabel = (k: CategoryKey) => PACKAGING_CATEGORIES.find((c) => c.key === k)?.label ?? k;
export const placeOf = (m: DirectoryManufacturer) => [m.city, m.state].filter(Boolean).join(", ");
export const enquiryHref = (name: string) =>
  `mailto:contact@snapit.club?subject=${encodeURIComponent(`Quote request – ${name}`)}`;
