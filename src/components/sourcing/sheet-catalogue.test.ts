import { describe, expect, it } from "vitest";
import { SHEET_DESIGNS, sheetDesign } from "./sheet-catalogue";

describe("spreadsheet catalogue", () => {
  it("loads only boxes and pouches with photos", () => {
    expect(SHEET_DESIGNS.length).toBe(633);
    expect(SHEET_DESIGNS.every(d => (d.family === "boxes" || d.family === "pouches") && d.image)).toBe(true);
  });
  it("prefers the photo classification over keyword rules", () => {
    const d = sheetDesign({ id: "Y", f: "pouches", c: "2.1.4", l2: "Stand-up", l3: "Std", n: "P", img: "a", ai: { style: "Spout", useCase: "Cosmetics" } });
    expect(d.attributes.style).toEqual(["Spout"]);
    expect(d.categories).toEqual(["spout"]);
  });
  it("leaves printing unspecified when the source does not say", () => {
    const d = sheetDesign({ id: "X", f: "boxes", c: "1.1.2", l2: "Shipping", l3: "RSC", n: "Box", img: "a", t: ["3-ply"] });
    expect(d.attributes.printing).toBeUndefined();
    expect(d.attributes.style).toEqual(["Regular Slotted Carton (RSC)"]);
  });
});
