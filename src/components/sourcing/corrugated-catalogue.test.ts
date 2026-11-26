import { describe, expect, it } from "vitest";
import { DESIGN_SPECS, EMPTY_FILTERS, designRequirement, filterDesigns } from "./corrugated-catalogue";

describe("corrugated catalogue discovery", () => {
  it("keeps printed mailers discoverable in both relevant categories", () => {
    expect(filterDesigns("mailer", EMPTY_FILTERS).map(d => d.id)).toContain("logo-mailer");
    expect(filterDesigns("printed", EMPTY_FILTERS).map(d => d.id)).toContain("logo-mailer");
  });
  it("combines optional style, print, board and use case filters", () => {
    expect(filterDesigns("all", { style: "RSC", printing: "Multicolour", material: "Kraft", useCase: "Shipping" }).map(d => d.id)).toEqual(["brand-shipper"]);
  });
  it("returns no designs for incompatible filters", () => {
    expect(filterDesigns("mailer", { ...EMPTY_FILTERS, style: "RSC" })).toEqual([]);
  });
  it("prefills a design without inventing buyer quantity or dimensions", () => {
    const draft = designRequirement(DESIGN_SPECS[0]!);
    expect(draft).toContain("regular slotted carton (rsc)");
    expect(draft).toContain("Quantity, dimensions and budget are not decided yet.");
    expect(draft).not.toMatch(/\d/);
  });
});