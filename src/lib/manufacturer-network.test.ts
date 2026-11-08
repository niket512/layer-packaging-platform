import { describe, expect, it } from "vitest";
import { filterNetwork, listingDensity, manufacturerContact, networkManufacturers } from "./manufacturer-network";

describe("Uploaded manufacturer references", () => {
  it("does not invent unpublished contact details", () => {
    expect(manufacturerContact("Unknown manufacturer")).toEqual({ phone: undefined, tel: undefined, whatsapp: undefined });
  });
  it("opens supplied phone numbers through WhatsApp with an international number", () => {
    expect(manufacturerContact("Prime Pack Industries").tel).toBe("tel:+919885534567");
    expect(manufacturerContact("Prime Pack Industries").whatsapp).toBe("https://wa.me/919885534567");
    expect(manufacturerContact("M R Print Pack (Marutiram Print Pack)").whatsapp).toBe("https://wa.me/918885094004");
  });
  it("assigns increasing map density from actual listing counts", () => {
    expect([0, 1, 4, 9, 16].map(listingDensity)).toEqual(["none", "low", "medium", "high", "highest"]);
  });
  it("omits blank spreadsheet rows", () => {
    expect(networkManufacturers).toHaveLength(146);
    expect(networkManufacturers.every(row => row.company_name.trim().length > 0)).toBe(true);
  });
  it("combines city and state search", () => {
    const matches = filterNetwork("Ahmedabad", "Gujarat");
    expect(matches.map(row => row.company_name)).toContain("JK Packagings");
    expect(matches.every(row => row.state === "Gujarat")).toBe(true);
    expect(filterNetwork("Ahmedabad", "Kerala")).toEqual([]);
  });
  it("keeps research notes searchable without exposing them as sources", () => {
    const weak = filterNetwork("Vikrama", "");
    expect(weak).toHaveLength(1);
    expect(weak[0].notes).toContain("partner manufacturing unit");
  });
});
