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
    capabilities: ["HDPE blow moulding", "1000 ml to 8000 ml", "Handled jerry cans", "In-house moulds", "Custom mould: yes", "Custom color: yes", "Printing and labelling: yes"],
    brands: ["Derma Organics", "R n overseas", "Ajanta food", "Dameasy", "Hunger incl bombay sweets", "And many more"],
  },
  {
    name: "Dinoss",
    category: "bottles",
    location: "India",
    capabilities: ["HDPE bottles and jars", "Wide-mouth containers", "Custom neck finishes", "Custom mould: yes", "Custom color: yes", "Printing and labelling: yes"],
    brands: ["Reliance", "IOCL", "Propel"],
  },
  {
    name: "Regent Plast",
    category: "bottles",
    location: "India",
    capabilities: ["HDPE bottles and jars", "Wide-mouth containers", "Custom neck finishes", "Custom mould: yes", "Custom color: yes", "Printing and labelling: yes"],
    brands: ["Bayer (agrochemicals)", "Valvoline (automotive lubricants)", "Hindustan Unilever (Sunsilk)"],
  },
  {
    name: "Jade Polymers",
    category: "bottles",
    location: "India",
    capabilities: ["HDPE bottles", "Closure matching", "Small batch runs", "Custom mould: yes", "Custom color: yes", "Printing and labelling: yes"],
    brands: ["Animal Vet Mankind", "Bovian", "Cadila Pharmaceuticals", "Himalaya Wellness", "Amul"],
  },
  {
    name: "SNP Plastech",
    category: "bottles",
    location: "India",
    capabilities: ["HDPE containers", "Industrial packs", "Custom mould: yes", "Custom color: yes", "Printing and labelling: yes"],
    brands: [],
  },
  {
    name: "Elham MultiPlast LLP",
    category: "bottles",
    location: "India",
    capabilities: ["HDPE jars and jerry cans", "Handled bottles", "Edible oil packaging", "Custom mould: yes", "Custom color: yes", "Printing and labelling: yes"],
    brands: [],
  },
  {
    name: "Star Bottles",
    category: "bottles",
    location: "India",
    capabilities: ["HDPE bottles", "30 ml to 1000 ml", "Edible oil and hair oil packs", "Custom mould: yes", "Custom color: yes", "Printing and labelling: yes"],
    brands: ["Puvi"],
  },
  {
    name: "Aasic Plastics",
    category: "bottles",
    location: "Trichy, Tamil Nadu, India",
    established: "2004",
    capabilities: [
      "HDPE, LDPE and PET bottles",
      "Wide-mouth and short-mouth containers",
      "Pharma tablet and capsule packs",
      "Powder and asafoetida containers",
      "Flip-top cap bottles and 28 mm flip-top caps",
      "Spray bottles and plastic droppers",
      "Sterile containers and sweet boxes",
      "Edible oil and construction chemical packaging",
      "Pesticide, fertilizer and agrochemical packs",
      "Lithium-ion battery cell holders",
      "Injection moulding and blow moulding",
      "Custom plastic engineering components",
      "Food-grade and UV-resistant material (on request)",
      "Induction sealing compatible necks",
      "Custom mould: yes",
      "Custom color: yes",
      "Printing and labelling: yes",
    ],
    brands: ["Chekko"],
    note: "Serves pharmaceutical, FMCG, personal care, food, edible oil, agrochemical, automotive, construction chemical and industrial brands across Tamil Nadu and South India.",
  },
];
