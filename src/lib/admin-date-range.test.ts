import { describe, expect, it } from "vitest";
import { inAdminDateRange } from "./admin-date-range";

describe("admin inclusive India date range", () => {
  const range = { from: "2026-11-10", to: "2026-11-10" };
  it("includes the full selected India day", () => {
    expect(inAdminDateRange("2026-11-09T18:30:00Z", range)).toBe(true);
    expect(inAdminDateRange("2026-11-10T18:29:59.999Z", range)).toBe(true);
    expect(inAdminDateRange("2026-11-09T18:29:59.999Z", range)).toBe(false);
    expect(inAdminDateRange("2026-11-10T18:30:00Z", range)).toBe(false);
  });
  it("supports open boundaries and clearing dates", () => {
    expect(inAdminDateRange("2026-11-11T00:00:00Z", { from: range.from, to: "" })).toBe(true);
    expect(inAdminDateRange("2026-11-08T00:00:00Z", { from: "", to: range.to })).toBe(true);
    expect(inAdminDateRange("2025-01-01T00:00:00Z", { from: "", to: "" })).toBe(true);
  });
  it("rejects reversed ranges", () => {
    expect(inAdminDateRange("2026-11-10T00:00:00Z", { from: "2026-11-11", to: "2026-11-10" })).toBe(false);
  });
});