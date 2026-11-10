import { describe, expect, it } from "vitest";
import { sourcingLandingFamily } from "./sourcing-landing";

describe("search-specific packaging landing", () => {
  it("selects the homepage pouch form and catalogue from Google Ads matched keywords", () => {
    expect(sourcingLandingFamily(undefined, "?keyword=stand+up+pouch+manufacturers&gclid=opaque")).toBe("pouches");
    expect(sourcingLandingFamily(undefined, "?keyword=flexible+pouches")).toBe("pouches");
    expect(sourcingLandingFamily(undefined, "?utm_term=printed+sachet+suppliers")).toBe("pouches");
  });
  it("keeps boxes for box keywords, missing keywords and ambiguous packaging searches", () => {
    expect(sourcingLandingFamily(undefined, "?keyword=corrugated+box+manufacturers")).toBe("boxes");
    expect(sourcingLandingFamily(undefined, "?keyword=boxes+and+pouches")).toBe("boxes");
    expect(sourcingLandingFamily(undefined, "?gclid=opaque")).toBe("boxes");
    expect(sourcingLandingFamily(undefined, "?keyword=%7Bkeyword%7D")).toBe("boxes");
    expect(sourcingLandingFamily(undefined, "?keyword=pouched+food")).toBe("boxes");
  });
  it("lets an explicit family override a matched keyword", () => {
    expect(sourcingLandingFamily(undefined, "?category=boxes&keyword=pouches")).toBe("boxes");
  });
  it("selects pouches for pouch and sachet search pages", () => {
    expect(sourcingLandingFamily("flexible-pouches")).toBe("pouches");
    expect(sourcingLandingFamily("sachets")).toBe("pouches");
  });
  it("keeps boxes as the default and on box search pages", () => {
    expect(sourcingLandingFamily()).toBe("boxes");
    expect(sourcingLandingFamily("corrugated-boxes")).toBe("boxes");
    expect(sourcingLandingFamily("mailer-boxes")).toBe("boxes");
    expect(sourcingLandingFamily(undefined, "?category=unknown")).toBe("boxes");
  });
  it("supports explicit pouch campaign links without guessing Google search terms", () => {
    expect(sourcingLandingFamily(undefined, "?category=pouches&utm_source=google")).toBe("pouches");
    expect(sourcingLandingFamily(undefined, "?utm_source=google")).toBe("boxes");
    expect(sourcingLandingFamily("corrugated-boxes", "?category=pouches")).toBe("boxes");
  });
});