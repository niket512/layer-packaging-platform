import { describe, expect, it } from "vitest";
import { addDesign, funnelOutcome, scrollDepth, trafficSource, type VisitorSnapshot, type VisitorReportRow } from "./visitor-metrics";
const snapshot = (): VisitorSnapshot => ({ device: "desktop", source: "direct", steps: {}, scroll_depth: {}, viewed_designs: [], opened_designs: [], selected_designs: [] });
describe("visitor behaviour rules", () => {
  it("measures how far the scrollable page has been travelled", () => {
    expect(scrollDepth(500, 2000, 1000)).toBe(50);
    expect(scrollDepth(1000, 2000, 1000)).toBe(100);
    expect(scrollDepth(0, 800, 1000)).toBe(0);
  });
  it("counts each viewed catalogue reference once, not automatic loading", () => {
    const value = snapshot();
    expect(value.viewed_designs).toHaveLength(0);
    expect(addDesign(value, "viewed", "box-1")).toBe(true);
    expect(addDesign(value, "viewed", "box-1")).toBe(false);
    expect(value.viewed_designs).toEqual(["box-1"]);
    expect(value.opened_designs).toHaveLength(0);
  });
  it("keeps measurements free of arbitrary contact and message strings", () => {
    const value = snapshot();
    expect(addDesign(value, "viewed", "+91 98765 43210")).toBe(false);
    expect(addDesign(value, "opened", "I need boxes")).toBe(false);
  });
  it("measures question drop-off only among visitors shown questions", () => {
    const rows = [{ steps: { questions_shown: 1, questions_answered: 2 } }, { steps: { questions_shown: 1 } }, { steps: { design_shown: 1 } }] as VisitorReportRow[];
    expect(funnelOutcome(rows, "questions_shown", "questions_answered")).toEqual({ reached: 2, continued: 1, notYet: 1 });
  });
  it("groups traffic without retaining full referrers or advertising identifiers", () => {
    expect(trafficSource("?gclid=private-id", "", "https://snaplogo.in")).toBe("paid_search");
    expect(trafficSource("", "https://www.google.co.in/search?q=boxes", "https://snaplogo.in")).toBe("organic_search");
    expect(trafficSource("", "https://snaplogo.in/designs", "https://snaplogo.in")).toBe("direct");
  });
});