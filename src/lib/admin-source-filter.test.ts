import { describe, expect, it } from "vitest";
import { matchesAdminSource } from "./admin-source-filter";
describe("admin source filter", () => {
  it("includes every source when all sources is selected", () => {
    expect(["direct", "paid_search", undefined].filter(source => matchesAdminSource(source, "all"))).toHaveLength(3);
  });
  it("includes only the selected recorded source", () => {
    expect(["direct", "paid_search", "organic_search", undefined].filter(source => matchesAdminSource(source, "paid_search"))).toEqual(["paid_search"]);
  });
  it("does not label unlinked historical chats as direct traffic", () => {
    expect(matchesAdminSource(undefined, "unknown")).toBe(true);
    expect(matchesAdminSource(undefined, "direct")).toBe(false);
  });
});