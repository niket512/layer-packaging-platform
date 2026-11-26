import { describe, expect, it, vi } from "vitest";
import { readRedditClickId } from "./reddit-attribution";
import { redditClickMatch, usableRedditClickId } from "@/lib/reddit-click-id";

describe("Reddit click attribution", () => {
  it("omits the reported fabricated match key without removing the Lead", () => {
    expect({ event_type: { tracking_type: "Lead" }, ...redditClickMatch("lovable_test_click") })
      .toEqual({ event_type: { tracking_type: "Lead" } });
  });

  it("removes the test ID left in browser storage", () => {
    const storage = { getItem: vi.fn(() => "lovable_test_click"), removeItem: vi.fn() };
    expect(readRedditClickId(storage)).toBeUndefined();
    expect(storage.removeItem).toHaveBeenCalledWith("rdt_cid");
  });

  it("passes through a URL click ID unchanged", () => {
    const clickId = "31847420452918132";
    expect(redditClickMatch(clickId)).toEqual({ click_id: clickId });
    const storage = { getItem: vi.fn(() => clickId), removeItem: vi.fn() };
    expect(readRedditClickId(storage)).toBe(clickId);
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  it("does not assume opaque Reddit IDs must have a numeric format", () => {
    expect(usableRedditClickId("opaque-url-value_123")).toBe("opaque-url-value_123");
  });

  it.each([null, undefined, "", " lovable_test_click", "bad\nvalue", "x".repeat(501)])
    ("omits unusable input %s", value => expect(redditClickMatch(value)).toEqual({}));

  it("allows a Lead without click attribution when browser storage is unavailable", () => {
    expect(readRedditClickId({ getItem: () => { throw new Error("blocked"); }, removeItem: vi.fn() }))
      .toBeUndefined();
  });
});