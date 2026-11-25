import { describe, expect, it } from "vitest";
import { emptyEnquiry, enquiryBrief, enquiryDetails, finishOptions, formVariant, materialOptions, pruneForTypes, stepErrors } from "./box-enquiry";

const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };
describe("box enquiry", () => {
  it("rigid boxes offer magnetic closure and foil, corrugated does not", () => {
    expect(finishOptions(["rigid"])).toContain("Magnetic closure");
    expect(finishOptions(["rigid"])).toContain("Foil stamping");
    expect(finishOptions(["corrugated"])).not.toContain("Magnetic closure");
    expect(materialOptions(["rigid"])).toContain("Rigid board");
    expect(materialOptions(["corrugated"])).not.toContain("Rigid board");
  });
  it("changing box type drops finishes that no longer apply", () => {
    const e = pruneForTypes({ ...emptyEnquiry(), boxTypes: ["corrugated"], finishes: ["Magnetic closure", "Partitions"], material: "Rigid board" });
    expect(e.finishes).toEqual(["Partitions"]);
    expect(e.material).toBe("");
  });
  it("step 1 needs a box type; step 2 has no mandatory fields", () => {
    expect(stepErrors(emptyEnquiry(), 0)).not.toBeNull();
    expect(stepErrors(emptyEnquiry(), 1)).toBeNull();
  });
  it("PIN code must be six digits", () => {
    expect(stepErrors({ ...emptyEnquiry(), pincode: "4000" }, 1)).not.toBeNull();
    expect(stepErrors({ ...emptyEnquiry(), pincode: "400001" }, 1)).toBeNull();
  });
  it("contact step needs name and Indian WhatsApp; email optional", () => {
    expect(stepErrors({ ...emptyEnquiry(), name: "A", phone: "12345" }, 2)).not.toBeNull();
    expect(stepErrors({ ...emptyEnquiry(), name: "A", phone: "98765 43210" }, 2)).toBeNull();
    expect(stepErrors({ ...emptyEnquiry(), name: "A", phone: "98765 43210", email: "bad" }, 2)).not.toBeNull();
  });
  it("large quantities are kept without a cap", () => {
    const e = { ...emptyEnquiry(), boxTypes: ["rigid" as const], quantityBand: "25,000+", quantityExact: "1,00,000", products: ["Haircare", "Other"], productOther: "Candles" };
    expect(enquiryDetails(e, "v2").quantity_exact).toBe(100000);
    expect(enquiryBrief(e).find(f => f.topic === "product")?.value).toBe("Haircare, Other: Candles");
  });
  it("variant is sticky and can be forced", () => {
    const s = mem();
    expect(formVariant("", s, () => 0.1)).toBe("v2");
    expect(formVariant("", s, () => 0.9)).toBe("v2");
    expect(formVariant("?form=classic", s)).toBe("classic");
    expect(formVariant("", s, () => 0.1)).toBe("classic");
  });
});
