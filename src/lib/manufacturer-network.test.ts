import { describe, expect, it } from "vitest";
import { filterNetwork, networkManufacturers, sourceLinks } from "./manufacturer-network";

describe("Uploaded manufacturer references", () => {
  it("omits blank spreadsheet rows", () => {
    expect(networkManufacturers).toHaveLength(146);
    expect(networkManufacturers.every(row => row.company_name.trim().length > 0)).toBe(true);
  });
  it("combines city and state search", () => {
    const matches = filterNetwork("Ahmedabad", "Gujarat", "official website");
    expect(matches.map(row => row.company_name)).toContain("JK Packagings");
    expect(matches.every(row => row.state === "Gujarat" && row.verification_status === "official website")).toBe(true);
    expect(filterNetwork("Ahmedabad", "Kerala", "")).toEqual([]);
  });
  it("preserves the research caveat for weak leads", () => {
    const weak = filterNetwork("Vikrama", "", "weak lead");
    expect(weak).toHaveLength(1);
    expect(weak[0].notes).toContain("partner manufacturing unit");
  });
  it("only exposes valid web sources", () => {
    expect(sourceLinks({ ...networkManufacturers[0], website: "javascript:alert(1)", source_urls: "https://example.com/ | invalid" })).toEqual(["https://example.com/"]);
  });
});