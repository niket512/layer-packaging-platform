import { describe, expect, it } from "vitest";
import { BOX_TYPES, emptyEnquiry, enquiryBrief, enquiryDetails, enquirySummary, enquiryText, formVariant, materialOptions, needsWall, parseBoxSize, pruneForTypes, singleChoiceEnquiry, stepErrors, type BoxType } from "./box-enquiry";

const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };
describe("box enquiry", () => {
  it("parses length, breadth and height from one input without changing saved units", () => {
    for (const raw of ["12 x 8 x 6", "12 × 8 × 6", "12 8 6", "12,8,6"]) {
      expect(parseBoxSize(raw)).toEqual({ length: "12", width: "8", height: "6" });
    }
    const size = parseBoxSize("12.5 x 8 x 6");
    expect(size?.length).toBe("12.5");
    expect(enquiryDetails({ ...emptyEnquiry(), ...size }, "v2").dimensions_cm).toEqual([31.8, 20.3, 15.2]);
  });
  it("rejects incomplete size input but lets users leave it blank", () => {
    expect(parseBoxSize("12 x 8")).toBeNull();
    expect(parseBoxSize("12 x 0 x 6")).toBeNull();
    expect(parseBoxSize("12 x 8 x 6 x 4")).toBeNull();
    expect(stepErrors({ ...emptyEnquiry(), quantityExact: "1000", sizeInput: "12 x 8" }, 1)).not.toBeNull();
    expect(stepErrors({ ...emptyEnquiry(), quantityExact: "1000", sizeInput: "" }, 1)).toBeNull();
  });
  it("allows exactly one box type", () => {
    expect(stepErrors({ ...emptyEnquiry(), boxTypes: ["mailer"] }, 0)).toBeNull();
    expect(stepErrors({ ...emptyEnquiry(), boxTypes: ["mailer", "rigid"] }, 0)).not.toBeNull();
  });
  it("restores unsent drafts with one box type and one product", () => {
    const draft = { ...emptyEnquiry(), boxTypes: ["rigid", "mailer"] as const, products: ["Haircare", "Food & snacks"], quantityExact: "1000", wall: "5-ply" };
    const restored = singleChoiceEnquiry({ ...draft, boxTypes: [...draft.boxTypes] });
    expect(restored.boxTypes).toEqual(["rigid"]);
    expect(restored.products).toEqual(["Haircare"]);
    expect(restored.quantityExact).toBe("1000");
    expect(restored.wall).toBe("");
    expect(draft.products).toHaveLength(2);
  });
  it("retired styles are not offered and drop out of unsent drafts", () => {
    expect(BOX_TYPES.map(b => b.id)).not.toContain("sleeve");
    expect(BOX_TYPES.map(b => b.id)).not.toContain("gable");
    expect(BOX_TYPES.map(b => b.id)).not.toContain("custom");
    expect(BOX_TYPES.map(b => b.id)).not.toContain("pillow");
    const restored = singleChoiceEnquiry({ ...emptyEnquiry(), boxTypes: ["sleeve" as unknown as BoxType], quantityExact: "500" });
    expect(restored.boxTypes).toEqual([]);
    expect(restored.quantityExact).toBe("500");
    const bespoke = singleChoiceEnquiry({ ...emptyEnquiry(), boxTypes: ["custom" as unknown as BoxType], quantityExact: "750" });
    expect(bespoke.boxTypes).toEqual([]);
    expect(bespoke.quantityExact).toBe("750");
  });
  it("material choices follow the box type", () => {
    expect(materialOptions(["rigid"])).toContain("Rigid board");
    expect(materialOptions(["corrugated"])).not.toContain("Rigid board");
  });
  it("changing box type drops material and wall that no longer apply", () => {
    const e = pruneForTypes({ ...emptyEnquiry(), boxTypes: ["corrugated"], material: "Rigid board", wall: "5-ply" });
    expect(e.material).toBe("");
    expect(e.wall).toBe("5-ply");
    const p = pruneForTypes({ ...e, boxTypes: ["rigid"] });
    expect(p.wall).toBe("");
  });
  it("step 1 needs a box type; the project-details step needs a quantity", () => {
    expect(stepErrors(emptyEnquiry(), 0)).not.toBeNull();
    expect(stepErrors(emptyEnquiry(), 1)).not.toBeNull();
    expect(stepErrors({ ...emptyEnquiry(), quantityExact: "12000" }, 1)).toBeNull();
    expect(stepErrors({ ...emptyEnquiry(), quantityExact: "abc" }, 1)).not.toBeNull();
  });
  it("contact is the final step and needs only an Indian WhatsApp number", () => {
    expect(stepErrors({ ...emptyEnquiry(), phone: "12345" }, 2)).not.toBeNull();
    expect(stepErrors({ ...emptyEnquiry(), phone: "98765 43210" }, 2)).toBeNull();
  });
  it("project details are the second step and never re-ask for contact", () => {
    expect(stepErrors({ ...emptyEnquiry(), quantityExact: "500" }, 1)).toBeNull();
    expect(stepErrors({ ...emptyEnquiry(), quantityExact: "500", phone: "", pincode: "4000" }, 1)).toBeNull();
  });
  it("PIN code is asked on the contact step and must be six digits", () => {
    expect(stepErrors({ ...emptyEnquiry(), phone: "98765 43210", pincode: "4000" }, 2)).not.toBeNull();
    expect(stepErrors({ ...emptyEnquiry(), phone: "98765 43210", pincode: "400001" }, 2)).toBeNull();
  });
  it("contact step needs only an Indian WhatsApp number; no name or email", () => {
    const details = enquiryDetails({ ...emptyEnquiry(), phone: "98765 43210" }, "v2") as Record<string, unknown>;
    expect(details).not.toHaveProperty("name");
    expect(details).not.toHaveProperty("email");
  });
  it("quantity is collected; printing, finishes and timeline are not", () => {
    const e = { ...emptyEnquiry(), boxTypes: ["rigid" as const], products: ["Haircare", "Other"], productOther: "Candles", quantityExact: "2,500", pincode: "400001" };
    const summary = enquirySummary(e);
    expect(summary.find(([k]) => k === "Quantity")?.[1]).toBe("2,500");
    expect(summary.map(([k]) => k)).not.toContain("Printing");
    expect(summary.map(([k]) => k)).not.toContain("Finishes & customisation");
    expect(summary.map(([k]) => k)).not.toContain("Timeline");
    const details = enquiryDetails(e, "v2") as Record<string, unknown>;
    expect(details["quantity_exact"]).toBe("2,500");
    expect(details).not.toHaveProperty("quantity_band");
    expect(details).not.toHaveProperty("printing");
    expect(details).not.toHaveProperty("finishes");
    expect(details).not.toHaveProperty("timeline");
    expect(enquiryBrief(e).find(f => f.topic === "quantity")?.value).toBe("2,500");
    expect(enquiryBrief(e).map(f => f.topic)).not.toContain("printing");
  });
  it("products stay uncapped and the finishing-notes field is gone", () => {
    const e = { ...emptyEnquiry(), boxTypes: ["rigid" as const], products: ["Haircare", "Other"], productOther: "Candles", pincode: "400001" };
    expect(enquiryDetails(e, "v2").pincode).toBe("400001");
    expect(enquiryDetails(e, "v2")).not.toHaveProperty("product_details");
    expect(enquirySummary(e).some(([k]) => k === "Anything else")).toBe(false);
    expect(enquiryBrief(e).map(f => f.topic)).not.toContain("customisation");
    expect(enquiryBrief(e).find(f => f.topic === "product")?.value).toBe("Haircare, Other: Candles");
  });
  it("inches are the default dimension unit and convert to cm on save", () => {
    expect(emptyEnquiry().unit).toBe("in");
    const e = { ...emptyEnquiry(), boxTypes: ["mailer" as const], length: "12", width: "8", height: "6" };
    expect(enquirySummary(e).find(([k]) => k === "Dimensions (L × W × H)")?.[1]).toBe("12 × 8 × 6 in");
    const details = enquiryDetails(e, "v2") as Record<string, unknown>;
    expect(details["dimensions_unit_entered"]).toBe("in");
    expect(details["dimensions_cm"]).toEqual([30.5, 20.3, 15.2]);
    const cm = { ...e, unit: "cm" as const };
    expect(enquiryDetails(cm, "v2").dimensions_cm).toEqual([12, 8, 6]);
    expect(enquiryDetails(cm, "v2").dimensions_unit_entered).toBe("cm");
    const legacy = { ...e, unit: undefined };
    expect(enquirySummary(legacy).find(([k]) => k === "Dimensions (L × W × H)")?.[1]).toBe("12 × 8 × 6 in");
    expect(enquiryDetails(legacy, "v2").dimensions_unit_entered).toBe("in");
  });
  it("records how many design photos were attached", () => {
    const e = { ...emptyEnquiry(), boxTypes: ["mailer" as const], quantityExact: "500" };
    expect(enquiryDetails(e, "v2").design_photos).toBeNull();
    expect(enquiryDetails(e, "v2", 2).design_photos).toBe(2);
    expect(enquiryText(e, 1)).toContain("Design reference: 1 photo attached");
    expect(enquiryText(e, 2)).toContain("Design reference: 2 photos attached");
    expect(enquiryText(e)).not.toContain("Design reference");
  });
  it("variant is sticky and can be forced", () => {
    const s = mem();
    expect(formVariant("", s, () => 0.1)).toBe("v2");
    expect(formVariant("", s, () => 0.9)).toBe("v2");
    expect(formVariant("?form=classic", s)).toBe("classic");
    expect(formVariant("", s, () => 0.1)).toBe("classic");
  });
});
