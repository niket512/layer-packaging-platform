export type ManufacturerProfile = {
  /** Must match the manufacturer name used in the catalogue data */
  name: string;
  category: "bottles" | "sachets" | "boxes";
  location?: string;
  established?: string;
  capabilities: string[];
  /** Brands this manufacturer has produced for. Empty until shared by the supplier. */
  brands: string[];
  note?: string;
};

export const manufacturerProfiles: ManufacturerProfile[] = [
  {
    name: "RAGSAA Innovation",
    category: "boxes",
    location: "Jaipur, Rajasthan, India",
    capabilities: [
      "Corrugated boxes: 3-ply, 5-ply and 7-ply",
      "Printed and custom die-cut boxes",
      "E-commerce and export packaging",
      "Cake and pizza boxes",
      "Paper food packaging and bags",
      "Corporate gifting, printing and branding",
    ],
    brands: [],
    note: "Customised packaging based on product, quantity and budget. MOQ, capacity, lead time and delivery coverage to be confirmed.",
  },
  {
    name: "Evepack",
    category: "sachets",
    location: "Esenyurt, Istanbul, Türkiye",
    capabilities: [
      "Stand-up pouches (doypack)",
      "Flat-bottom and quadro packaging",
      "Sachets",
      "Roll-stock packaging films",
      "Custom structures, finishes, zippers and barrier options",
      "Digital printing — custom packs in about one week",
    ],
    brands: [],
    note: "MOQ, pricing, delivery to India, import logistics, certifications and lead times to be confirmed.",
  },
];
