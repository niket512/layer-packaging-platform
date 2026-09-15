export type ManufacturerProfile = {
  /** Must match the manufacturer name used in the catalogue data */
  name: string;
  category: "bottles" | "sachets";
  location?: string;
  established?: string;
  capabilities: string[];
  /** Brands this manufacturer has produced for. Empty until shared by the supplier. */
  brands: string[];
  note?: string;
};

export const manufacturerProfiles: ManufacturerProfile[] = [
  {
    name: "Teknobyte",
    category: "bottles",
    location: "India",
    capabilities: ["HDPE blow moulding", "1000 ml to 8000 ml", "Handled jerry cans", "In-house moulds"],
    brands: [],
  },
  {
    name: "Dinoss",
    category: "bottles",
    location: "India",
    capabilities: ["HDPE bottles and jars", "Wide-mouth containers", "Custom neck finishes"],
    brands: [],
  },
  {
    name: "Jade Polymers",
    category: "bottles",
    location: "India",
    capabilities: ["HDPE bottles", "Closure matching", "Small batch runs"],
    brands: [],
  },
  {
    name: "SNP Plastech",
    category: "bottles",
    location: "India",
    capabilities: ["HDPE containers", "Industrial packs"],
    brands: [],
  },
];
