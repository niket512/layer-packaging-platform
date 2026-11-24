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
import { consumeConversion, markConversionPending } from "./sourcing-conversion";
describe("thank-you conversions fire once", () => {
  const store = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) }; };
  it("fires for a fresh enquiry and not on refresh", () => {
    const s = store(); markConversionPending("lead-1", s);
    expect(consumeConversion("lead-1", s)).toBe(true);
    expect(consumeConversion("lead-1", s)).toBe(false);
  });
  it("does not fire without a saved enquiry", () => { expect(consumeConversion("lead-2", store())).toBe(false); });
  it("re-saving the same ID never fires twice", () => {
    const s = store(); markConversionPending("lead-3", s); consumeConversion("lead-3", s); markConversionPending("lead-3", s);
    expect(consumeConversion("lead-3", s)).toBe(false);
  });
});
