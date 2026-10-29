import { describe, expect, it } from "vitest";
import { BOX_DESIGNS, CLEAR_FILTERS, browseDesigns, selectedDesignRequirement } from "./packaging-catalogue";
import { POUCH_DESIGNS } from "./pouch-designs";

const designs = [...BOX_DESIGNS, ...POUCH_DESIGNS];
describe("packaging browsing", () => {
  it("switches to a dedicated pouch catalogue", () => {
    const shown = browseDesigns(designs, "pouches", "all", CLEAR_FILTERS, "", "default");
    expect(shown.length).toBe(25);
    expect(shown.every(d => d.family === "pouches")).toBe(true);
  });
  it("keeps a printed mailer in all its relevant categories", () => {
    for (const category of ["mailer", "printed", "subscription", "product"]) {
      expect(browseDesigns(designs, "boxes", category, CLEAR_FILTERS, "", "default").map(d => d.id)).toContain("logo-mailer");
    }
  });
  it("combines format and feature filters", () => {
    expect(browseDesigns(designs, "pouches", "all", { ...CLEAR_FILTERS, style: "Stand-up", features: "Zipper" }, "", "default").map(d => d.id)).toEqual(["reference-standup"]);
  });
  it("does not fabricate material or order quantity", () => {
    expect(designs.every(d => !d.attributes.material && !d.attributes.quantity)).toBe(true);
    expect(browseDesigns(designs, "pouches", "all", { ...CLEAR_FILTERS, material: "PET laminate" }, "", "default")).toEqual([]);
    expect(browseDesigns(designs, "pouches", "all", { ...CLEAR_FILTERS, material: "unspecified" }, "", "default")).toHaveLength(25);
  });
  it("searches attributes and sorts names", () => {
    const result = browseDesigns(designs, "pouches", "all", CLEAR_FILTERS, "zipper", "az");
    expect(result.map(d => d.id)).toEqual(["reference-flatbottom", "reference-standup"]);
  });
  it("populates all references without invented buyer specifications", () => {
    const text = selectedDesignRequirement([BOX_DESIGNS[0], POUCH_DESIGNS[0]]);
    expect(text).toContain("[kraft-ship]"); expect(text).toContain("[reference-standup]");
    expect(text).toContain("corrugated boxes and flexible pouches");
    expect(text).not.toMatch(/5,000|25×|budget.*\d|not decided/);
  });
});