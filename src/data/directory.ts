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

/** Designs buyers can ask for, per packaging category. Shown on the explore page. */
export const CATEGORY_DESIGNS: Partial<Record<CategoryKey, { name: string; note: string }[]>> = {
  corrugated: [
    { name: "Regular slotted carton (RSC)", note: "Standard shipping box, 3/5/7-ply" },
    { name: "Die-cut box", note: "Custom shape, self-locking" },
    { name: "Mailer / e-commerce box", note: "Easy-fold, branded unboxing" },
    { name: "Telescopic box", note: "Separate lid and base" },
    { name: "Auto-lock bottom box", note: "Quick assembly for packing lines" },
    { name: "Partition / divider box", note: "For bottles, jars and fragile items" },
    { name: "Heavy-duty export box", note: "5-ply and 7-ply for long transit" },
    { name: "Pizza & food box", note: "Food-grade, grease-resistant" },
    { name: "Printed retail display box", note: "Counter and shelf-ready" },
  ],
  flexible: [
    { name: "Stand-up pouch", note: "With or without zipper" },
    { name: "Flat / three-side seal pouch", note: "Sachets and single-serve" },
    { name: "Pillow pouch", note: "Back-seal, snacks and powders" },
    { name: "Spout pouch", note: "Liquids, oils and purees" },
    { name: "Gusseted pouch", note: "Side or bottom gusset, higher volume" },
    { name: "Quad-seal pouch", note: "Premium coffee and pet food" },
    { name: "Stick pack", note: "Slim single-dose format" },
    { name: "Roll stock", note: "Printed film for form-fill-seal lines" },
    { name: "Vacuum pouch", note: "High-barrier, extended shelf life" },
  ],
};

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
  /** Public phone number, shown with a WhatsApp enquiry CTA. Null until the supplier shares it. */
  phone: string | null;
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
    phone: "+91 98108 84245",
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
    phone: "+91 92510 07198",
    listing_status: "published",
    last_updated_at: "2026-10-12",
  },
  {
    id: "7ply",
    slug: "7ply",
    name: "7ply",
    logo_url: null,
    cover_image_url: cartons,
    description:
      "Mumbai-based custom print and packaging partner taking work from idea to prototype to production, with most output made in-house. Handles corrugated, rigid and personalised packaging, paper bags, retail displays and event installations — no minimum order, short-run printing and 24–48 hour samples.",
    city: "Navi Mumbai",
    state: "Maharashtra",
    website_url: "https://www.7ply.in",
    packaging_categories: ["corrugated", "cartons", "paper-bags", "other"],
    customization_capabilities: ["custom-sizes", "custom-printing", "custom-structures", "material-options"],
    printing_capabilities: ["custom-manufacturing"],
    products: [
      "Custom corrugated, rigid and personalised packaging",
      "Paper bags and shopping bags",
      "Gift and promotional boxes with custom fitments",
      "Retail signage, floor and countertop displays",
      "Event booths, pop-ups and visual merchandising",
    ],
    minimum_order_quantities: [{ scope: "All custom work", value: "No MOQ — from 1 unit" }],
    lead_times: [{ scope: "Samples", value: "24–48 hours" }],
    delivery_locations: null,
    phone: "+91 75061 55566",
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
/** Lowest stated MOQ in units; null when the supplier hasn't confirmed one. */
export const moqUnits = (m: DirectoryManufacturer): number | null => {
  const nums = m.minimum_order_quantities.flatMap((f) => {
    if (/no moq/i.test(f.value)) return [1];
    const n = f.value.replace(/,/g, "").match(/\d+/);
    return n ? [Number(n[0])] : [];
  });
  return nums.length ? Math.min(...nums) : null;
};
export const enquiryHref = (name: string) =>
  `mailto:contact@snapit.club?subject=${encodeURIComponent(`Quote request – ${name}`)}`;
export const waDigits = (phone: string) => phone.replace(/\D/g, "");
export const whatsappHref = (name: string, phone: string) =>
  `https://wa.me/${waDigits(phone)}?text=${encodeURIComponent(
    `Hi, I found ${name} on Snaplogo and would like a quote for custom packaging.`
  )}`;
