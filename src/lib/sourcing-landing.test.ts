import { describe, expect, it } from "vitest";
import { sourcingLandingFamily } from "./sourcing-landing";

describe("search-specific packaging landing", () => {
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