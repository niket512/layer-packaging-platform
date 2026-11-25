import { describe, expect, it } from "vitest";
import { emptyEnquiry, enquiryBrief, enquiryDetails, enquirySummary, formVariant, materialOptions, pruneForTypes, stepErrors } from "./box-enquiry";

const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };
describe("box enquiry", () => {
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
  it("quantity, printing, finishes and timeline are not collected", () => {
    const e = { ...emptyEnquiry(), boxTypes: ["rigid" as const], products: ["Haircare", "Other"], productOther: "Candles", pincode: "400001" };
    const summary = enquirySummary(e).map(([k]) => k);
    expect(summary).not.toContain("Quantity");
    expect(summary).not.toContain("Printing");
    expect(summary).not.toContain("Finishes & customisation");
    expect(summary).not.toContain("Timeline");
    const details = enquiryDetails(e, "v2") as Record<string, unknown>;
    expect(details).not.toHaveProperty("quantity_band");
    expect(details).not.toHaveProperty("quantity_exact");
    expect(details).not.toHaveProperty("printing");
    expect(details).not.toHaveProperty("finishes");
    expect(details).not.toHaveProperty("timeline");
    expect(enquiryBrief(e).map(f => f.topic)).not.toContain("quantity");
    expect(enquiryBrief(e).map(f => f.topic)).not.toContain("printing");
    expect(enquiryBrief(e).map(f => f.topic)).not.toContain("customisation");
  });
  it("keeps products and delivery details without a cap", () => {
    const e = { ...emptyEnquiry(), boxTypes: ["rigid" as const], products: ["Haircare", "Other"], productOther: "Candles", pincode: "400001" };
    expect(enquiryDetails(e, "v2").pincode).toBe("400001");
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
