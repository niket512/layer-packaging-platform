import { describe, it, expect } from "vitest";
import { summariseChats } from "./chatAnalytics";
const base = { contact: null, created_at: "2026-11-01T10:00:00Z", updated_at: "2026-11-01T10:10:00Z", brief: [], transcript: [{ query: "hi", matches: [] }] };
describe("summariseChats", () => {
  it("computes conversion from submitted chats", () => {
    const s = summariseChats([{ ...base, status: "submitted" }, { ...base, status: "ongoing" }, { ...base, status: "ongoing" }, { ...base, status: "ongoing" }]);
    expect(s.conversion).toBe(25);
    expect(s.avgMinutes).toBe(10);
  });
  it("totals catalogue views and design uses only for linked chats", () => {
    const s = summariseChats([
      { ...base, status: "submitted", cataloguesViewed: 5, designsUsed: 2 },
      { ...base, status: "ongoing", cataloguesViewed: 3, designsUsed: 0 },
      { ...base, status: "ongoing" },
    ]);
    expect(s.cataloguesViewed).toBe(8);
    expect(s.designsUsed).toBe(2);
    expect(s.catalogueLinked).toBe(2);
  });
});
