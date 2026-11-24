import { describe, expect, it } from "vitest";
import { attributionFromUrl, nextAttribution } from "./attribution";
const ctx = { landing: "/?gclid=abc", referrer: "https://www.google.com/", device: "mobile", now: "2026-11-24T10:00:00Z" };
describe("ad attribution", () => {
  it("captures Google Ads parameters", () => {
    const a = attributionFromUrl("?gclid=abc&campaignid=11&adgroupid=22&keyword=mailer%20box&matchtype=p&utm_source=google&utm_medium=cpc", ctx)!;
    expect(a).toMatchObject({ gclid: "abc", campaign_id: "11", ad_group_id: "22", keyword: "mailer box", match_type: "p", utm_source: "google", utm_medium: "cpc", device: "mobile" });
  });
  it("ignores pages without ad parameters", () => { expect(attributionFromUrl("?category=boxes", ctx)).toBeNull(); });
  it("internal navigation keeps the original ad click", () => {
    const first = attributionFromUrl("?gclid=abc", ctx)!;
    expect(nextAttribution(first, null, { ...ctx, landing: "/sourcing" }, true).gclid).toBe("abc");
  });
  it("a new ad click replaces the old one", () => {
    const first = attributionFromUrl("?gclid=abc", ctx)!;
    expect(nextAttribution(first, attributionFromUrl("?gclid=xyz", ctx), ctx, false).gclid).toBe("xyz");
  });
});
