export type MoqTier = { label: string; value: string };
export type MoqSummary = { tiers: MoqTier[]; note?: string };

// Curated from supplied order notes, not inferred from other numbers in the record.
const summaries: Record<string, MoqSummary> = {
  "M R Print Pack (Marutiram Print Pack)": { tiers: [{ label: "Ready Box", value: "From 200 pieces" }], note: "Samples available" },
  "Skyline Commodities And Gases": { tiers: [{ label: "Listed 3-ply box", value: "1,000 pieces" }] },
  "Aaradhya Enterprises": { tiers: [{ label: "Listed 5-ply carton", value: "400 pieces" }] },
  "Vikrama Industries": { tiers: [{ label: "Standard boxes", value: "5,000 boxes" }, { label: "Larger sizes", value: "1,000 boxes" }] },
  "Sunrise Industries": { tiers: [{ label: "Preferred order", value: "1,000 pieces" }], note: "Flexible quantities" },
  "L D Enterprise": { tiers: [{ label: "Listed industrial box", value: "10,000" }], note: "Unit not specified" },
  "Shrushi Polymers Private Limited": { tiers: [{ label: "3-ply / 7-ply boxes", value: "100 pieces" }, { label: "Listed carton", value: "1,000 pieces" }] },
  "Bioleaf Manufacturing": { tiers: [{ label: "Custom printed", value: "Typically from 1,000 units" }], note: "Depends on dimensions" },
  "Majoka Industries": { tiers: [{ label: "Listed MOQ", value: "100 pieces" }] },
  "Aarisha Packaging Solutions Pvt Ltd": { tiers: [{ label: "Flexible MOQ", value: "From 500 pieces" }] },
  "Box Makers India": { tiers: [{ label: "Ready stock", value: "From 1 box" }] },
  "House of Packaging": { tiers: [{ label: "Listed MOQ", value: "1,000 pieces" }] },
  "BoxCraft Packaging": { tiers: [{ label: "Listed MOQ", value: "250" }], note: "Unit not specified" },
  "Sharda Packagings": { tiers: [{ label: "Selected products", value: "1,000 pieces" }] },
  "S. B. Packs & Prints": { tiers: [{ label: "Export / fish boxes", value: "10 pieces" }, { label: "Heavy-duty boxes", value: "100 pieces" }, { label: "Pharma printed boxes", value: "25 pieces" }] },
  "Well Kept Packaging": { tiers: [{ label: "3-ply / 5-ply boxes", value: "500 pieces" }] },
  "Arushi Industries": { tiers: [{ label: "Listed MOQ", value: "1,000 pieces" }] },
  "Vani Packaging": { tiers: [{ label: "Listed heavy-duty carton", value: "100 pieces" }] },
  "Sambhav Printers": { tiers: [{ label: "Double-wall 5-ply", value: "1,500 pieces" }, { label: "Printed 5-ply cartons", value: "800 pieces" }, { label: "E-commerce 3-ply", value: "2,500 pieces" }] },
  "Print Impression India Private Limited": { tiers: [{ label: "Printed corrugated box", value: "5,000 pieces" }] },
  "VEA Industries": { tiers: [{ label: "Selected products", value: "500 pieces" }, { label: "Heavy-duty product", value: "1,000 pieces" }] },
  "Hycorr Containers Pvt. Ltd.": { tiers: [{ label: "Listed MOQ", value: "5,000 pieces" }] },
  "Swiss Pac Pvt Ltd": { tiers: [{ label: "Stock", value: "100 pieces" }, { label: "Digital custom", value: "1,000 pieces" }, { label: "Rotogravure", value: "10,000 pieces" }] },
  "Giriraj Flexi Pack Pvt Ltd": { tiers: [{ label: "Listed MOQ", value: "500 kg" }], note: "Confirm with supplier" },
  "Sambhav Foils & Flexibles": { tiers: [{ label: "Selected pouches", value: "300–500 pieces" }, { label: "Laminates / rolls", value: "200–500 kg" }] },
  "PouchKart / Pacific Group": { tiers: [{ label: "Starting order", value: "From 500 pieces" }, { label: "Average MOQ", value: "5,000 pieces" }] },
  "Pouch Factory": { tiers: [{ label: "Pouches", value: "2,000–15,000 pieces" }, { label: "Spout pouch", value: "250 kg" }], note: "Depends on product" },
  "Royal Prints": { tiers: [{ label: "Pouches", value: "3,000–20,000 pieces" }, { label: "Flexo", value: "From 50 kg" }, { label: "Spout", value: "100 kg" }] },
  "Nicepack Polyplast (P) Ltd": { tiers: [{ label: "Listed MOQ", value: "1,000 kg" }] },
  "Stark Packmate": { tiers: [{ label: "Rolls", value: "200–400 kg" }, { label: "Pouches", value: "10,000–20,000 pieces" }] },
};

export function manufacturerMoq(company: string, notes = ""): MoqSummary {
  const known = summaries[company];
  if (known) return known;
  return { tiers: [], note: /project-specific|varies|depends/i.test(notes) ? "Depends on specification" : /small.*bulk|bulk.*small|flexible|small or bulk/i.test(notes) ? "Flexible orders · confirm quantity" : undefined };
}