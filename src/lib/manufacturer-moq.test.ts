import { describe, expect, it } from "vitest";
import { manufacturerMoq } from "./manufacturer-moq";

describe("Supplied manufacturer minimum orders", () => {
  it("does not treat ply, capacity or stock pack sizes as a minimum order", () => {
    expect(manufacturerMoq("Bharath Packaging Industries", "Products include 3-ply boxes and sheet rolls; MOQ not stated.").tiers).toEqual([]);
    expect(manufacturerMoq("Marvel Pack Industries", "Capacities up to 5 kg to 11-25 kg; no general MOQ stated.").tiers).toEqual([]);
    expect(manufacturerMoq("Packman Packaging", "Packs of 100 pieces for some products; exact custom MOQ unavailable.").tiers).toEqual([]);
  });
  it("keeps separate stock, digital and rotogravure minimums", () => {
    expect(manufacturerMoq("Swiss Pac Pvt Ltd").tiers).toEqual([
      { label: "Stock", value: "100 pieces" },
      { label: "Digital custom", value: "1,000 pieces" },
      { label: "Rotogravure", value: "10,000 pieces" },
    ]);
  });
  it("preserves piece and kilogram ranges without making them comparable", () => {
    expect(manufacturerMoq("Stark Packmate").tiers).toEqual([
      { label: "Rolls", value: "200–400 kg" },
      { label: "Pouches", value: "10,000–20,000 pieces" },
    ]);
  });
  it("does not infer units missing from the supplied MOQ", () => {
    expect(manufacturerMoq("BoxCraft Packaging")).toEqual({ tiers: [{ label: "Listed MOQ", value: "250" }], note: "Unit not specified" });
  });
});