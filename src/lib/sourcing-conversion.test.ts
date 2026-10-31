import { describe, expect, it, vi } from "vitest";
import { createSourcingLeadTracker } from "./sourcing-conversion";

describe("successful enquiry measurement", () => {
  it("does not count failed submissions", () => {
    const emit = vi.fn();
    const record = createSourcingLeadTracker(emit);
    expect(record("request-1", false)).toBe(false);
    expect(emit).not.toHaveBeenCalled();
  });
  it("counts a saved request once without sending buyer contact or brief", () => {
    const emit = vi.fn();
    const record = createSourcingLeadTracker(emit);
    expect(record("request-1", true)).toBe(true);
    expect(record("request-1", true)).toBe(false);
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith({ event: "sourcing_lead_submitted", lead_id: "request-1" });
  });
});