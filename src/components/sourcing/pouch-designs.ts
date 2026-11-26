import sachets from "@/data/sachets.json";
import standup from "@/assets/reference-standup-pouch.webp";
import flatbottom from "@/assets/reference-flatbottom-pouch.webp";
import spout from "@/assets/reference-spout-pouch.webp";
import type { PackagingDesign } from "./packaging-catalogue";

// Only format and application come from existing catalogue metadata. Technical data are unverified.
const examples: PackagingDesign[] = sachets.filter(d => !d.id.startsWith("mockup-")).map(d => {
  const style = d.format === "Flat sachet" ? "Sachet" : d.format === "Pillow pouch" ? "Pillow" : "Stick Pack";
  const application = d.use === "Snack" || d.use === "Edible oil" ? "Food & Snacks" : d.use === "Cosmetics" ? "Cosmetics" : d.use === "Personal care" || d.use === "Hair oil" ? "Personal Care" : "Other";
  return {
    id: d.id, name: d.name.split(" · ")[0] ?? d.name, family: "pouches", image: `/sachets/${d.id}.jpg`, illustrative: false,
    categories: style === "Sachet" ? ["flat", "sachet-stick"] : style === "Pillow" ? ["pillow"] : ["sachet-stick"],
    description: `An existing ${style.toLowerCase()} reference for ${d.use.toLowerCase()} packaging.`,
    attributes: { style: [style], useCase: [application] },
  };
});
export const POUCH_DESIGNS: PackagingDesign[] = [
  { id: "reference-standup", name: "Stand-up zipper pouch", family: "pouches", categories: ["stand-up"], image: standup, illustrative: true, description: "An upright, resealable format reference for dry-product packaging.", attributes: { style: ["Stand-up"], features: ["Zipper"], printing: ["Plain"] } },
  { id: "reference-flatbottom", name: "Flat-bottom pouch", family: "pouches", categories: ["flat-bottom"], image: flatbottom, illustrative: true, description: "A squared-base presentation reference for shelf display.", attributes: { style: ["Flat-bottom"], features: ["Zipper"], printing: ["Plain"] } },
  { id: "reference-spout", name: "Spout pouch", family: "pouches", categories: ["spout"], image: spout, illustrative: true, description: "A capped flexible format reference for pourable products.", attributes: { style: ["Spout"], features: ["Spout"], printing: ["Plain"] } },
  ...examples,
];