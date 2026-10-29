export type BoxCategory = "all" | "shipping" | "mailer" | "product" | "die-cut" | "printed";
export type DesignSpec = {
  id: string;
  name: string;
  categories: BoxCategory[];
  style: string;
  printing: string;
  material: string;
  useCase: string;
  description: string;
};

export const DESIGN_SPECS: DesignSpec[] = [
  { id: "kraft-ship", name: "Regular slotted carton (RSC)", categories: ["shipping"], style: "RSC", printing: "Plain", material: "Kraft", useCase: "Shipping", description: "Everyday e-commerce dispatch and product protection." },
  { id: "die-cut", name: "Die-cut carry box", categories: ["die-cut", "product"], style: "Die-cut", printing: "Plain", material: "White-top", useCase: "Product packaging", description: "A carry-handle format for retail products and takeaway packs." },
  { id: "logo-mailer", name: "White logo mailer", categories: ["mailer", "printed", "product"], style: "Mailer", printing: "1-colour", material: "White-top", useCase: "Product packaging", description: "A clean branded presentation for direct-to-consumer orders." },
  { id: "pattern-mailer", name: "Pattern printed mailer", categories: ["mailer", "printed"], style: "Mailer", printing: "Multicolour", material: "White-top", useCase: "Gifting", description: "All-over artwork for gifting and memorable unboxing." },
  { id: "brand-shipper", name: "Branded kraft shipper", categories: ["shipping", "printed"], style: "RSC", printing: "Multicolour", material: "Kraft", useCase: "Shipping", description: "A shipping carton with colourful brand artwork." },
  { id: "premium-mailer", name: "Premium black mailer", categories: ["mailer", "printed", "product"], style: "Mailer", printing: "Foil logo", material: "To be confirmed", useCase: "Gifting", description: "A dark presentation box with a metallic logo reference." },
];

export type DesignFilters = { style: string; printing: string; material: string; useCase: string };
export const EMPTY_FILTERS: DesignFilters = { style: "all", printing: "all", material: "all", useCase: "all" };

export function filterDesigns(category: BoxCategory, filters: DesignFilters) {
  return DESIGN_SPECS.filter(design =>
    (category === "all" || design.categories.includes(category)) &&
    (Object.keys(filters) as (keyof DesignFilters)[]).every(key => filters[key] === "all" || design[key] === filters[key])
  );
}

export function designRequirement(design: DesignSpec) {
  return `I need custom corrugated ${design.name.toLowerCase()} boxes for ${design.useCase.toLowerCase()}, based on this design reference. Printing preference: ${design.printing.toLowerCase()}.${design.material !== "To be confirmed" ? ` Board preference: ${design.material.toLowerCase()}.` : ""} Quantity, dimensions and budget are not decided yet.`;
}