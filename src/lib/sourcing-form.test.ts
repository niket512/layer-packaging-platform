import { describe, expect, it } from "vitest";
import { FORM_FORMATS, FORM_STEPS, NOT_SURE_SIZE, SIZE_SUGGESTIONS, indianMobile, applyDesignToForm, designFormPrefill, formBrief, formSubmission } from "./sourcing-form";
import { BOX_DESIGNS } from "@/components/sourcing/packaging-catalogue";
describe("guided packaging requirements", () => {
  it("keeps review progress and entered details when a design is selected", () => {
    const result = applyDesignToForm("boxes", { format: "Shipping box", quantity: "2000 pieces", size: "20 × 15 × 10 cm", delivery: "Pune" }, [BOX_DESIGNS[0]], 2);
    expect(result?.step).toBe(2);
    expect(result?.values).toMatchObject({ quantity: "2000 pieces", size: "20 × 15 × 10 cm", delivery: "Pune" });
  });
  it("moves a known design past packaging selection without inventing scale", () => {
    const result = applyDesignToForm("boxes", {}, [BOX_DESIGNS[0]], 0);
    expect(result?.step).toBe(1);
    expect(result?.values.quantity).toBeUndefined();
    expect(result?.values.size).toBeUndefined();
  });
  it("keeps unknown design styles at packaging selection", () => {
    const result = applyDesignToForm("boxes", {}, [{ ...BOX_DESIGNS[0], attributes: {} }], 0);
    expect(result?.step).toBe(0);
    expect(result?.values.format).toBeUndefined();
  });
  it("uses three steps with WhatsApp right after packaging", () => {
    expect(FORM_STEPS.map(step => step.label)).toEqual(["Packaging", "WhatsApp", "Details"]);
    expect(FORM_STEPS[1].topics).toEqual(["phone"]);
  });
  it("offers a not-sure packaging style and optional dimensions", () => {
    expect(FORM_FORMATS.boxes).toContain("Not sure, help me choose");
    expect(SIZE_SUGGESTIONS.boxes).toContain(NOT_SURE_SIZE);
  });
  it("accepts only Indian mobile numbers", () => {
    expect(indianMobile("98765 43210")).toBe("+91 9876543210");
    expect(indianMobile("+91 98765-43210")).toBe("+91 9876543210");
    expect(indianMobile("09876543210")).toBe("+91 9876543210");
    expect(indianMobile("12345 67890")).toBeNull();
    expect(indianMobile("98765")).toBeNull();
  });
  it("retains chosen material and finishing preferences in the submitted brief", () => {
    const brief = formBrief("boxes", { material: "Kraft", finishing: "Matte" });
    const payload = formSubmission(brief, "+91 98765 43210", "", []);
    expect(payload?.requirement).toContain("Material / board: Kraft [buyer]");
    expect(payload?.requirement).toContain("Finish: Matte [buyer]");
  });
  it("prefills supported reference attributes without inventing quantity, size or budget", () => {
    const result = designFormPrefill([{ ...BOX_DESIGNS[0], family: "pouches", attributes: { style: ["Stand-up"], printing: ["Multicolour"], material: ["Kraft"], features: ["Zipper"] } }]);
    expect(result).toEqual({ family: "pouches", values: { format: "Stand-up pouch", printing: "Multicolour", closure: "Zipper" } });
    expect(result?.values.quantity).toBeUndefined();
    expect(result?.values.size).toBeUndefined();
    expect(result?.values.budget).toBeUndefined();
  });
  it("preserves explicit quantity and units without inventing missing details", () => {
    const brief = formBrief("pouches", { format: "Stand-up pouch", quantity: "5000 pieces", size: "250 g", material: "" });
    expect(brief).toEqual([{ topic: "format", value: "Flexible pouches — Stand-up pouch", source: "buyer" }, { topic: "quantity", value: "5000 pieces", source: "buyer" }, { topic: "size", value: "250 g", source: "buyer" }]);
  });
  it("rejects invalid contact and retains photos and buyer notes in the saved payload", () => {
    const brief = formBrief("boxes", { quantity: "Not sure" });
    expect(formSubmission(brief, "123", "", [])).toBeNull();
    const payload = formSubmission(brief, "+91 98765 43210", "Use kraft board", ["data:image/jpeg;base64,eA=="]);
    expect(payload?.contact).toBe("+91 98765 43210");
    expect(payload?.requirement).toContain("Quantity / MOQ: Not sure [buyer]");
    expect(payload?.requirement).toContain("Use kraft board");
    expect(payload?.images).toEqual(["data:image/jpeg;base64,eA=="]);
    expect(payload?.manufacturers).toEqual([]);
  });
});