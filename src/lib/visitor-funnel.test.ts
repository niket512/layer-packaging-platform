import { describe, it, expect } from "vitest";
import { visitorFunnels, inIndiaToday } from "./visitor-funnel";
import type { VisitorReportRow } from "./visitor-metrics";
const row = (overrides: Partial<VisitorReportRow> = {}): VisitorReportRow => ({ id: "visit", created_at: "2026-11-09T00:00:00Z", updated_at: "2026-11-09T00:00:00Z", device: "mobile", source: "direct", steps: { page_opened: 1 }, viewed: 0, opened: 0, selected: 0, scroll_depth: {}, journey: [], ...overrides });
describe("full visitor funnel", () => {
  it("does not count opening the first form step as starting a request", () => {
    const result = visitorFunnels([row({ journey: [{ kind: "form_step", step: "1", path: "/", at: 1 }] })]);
    expect(result.form[0].rows).toHaveLength(1);
    expect(result.overall[2].rows).toHaveLength(0);
  });
  it("keeps four form stages separate from chat and counts field interaction", () => {
    const result = visitorFunnels([row({ journey: [{ kind: "form_step", step: "1", path: "/", at: 1 }, { kind: "field", field: "format", filled: true, step: "1", path: "/", at: 2 }, { kind: "form_step", step: "2", path: "/", at: 3 }] }), row({ steps: { page_opened: 1, first_message: 2 } })]);
    expect(result.form.slice(0, 4).map(stage => stage.rows.length)).toEqual([1, 1, 0, 0]);
    expect(result.chatCount).toBe(1);
    expect(result.overall[2].rows).toHaveLength(2);
  });
  it("does not mark bypassed optional chat questions as drop-offs", () => {
    const result = visitorFunnels([row({ steps: { page_opened: 1, first_message: 2, questions_shown: 3, contact_shown: 4 } })]);
    expect(result.chat[2].remaining).toHaveLength(0);
    expect(result.chat[3].rows).toHaveLength(0);
    expect(result.chat[7].remaining).toHaveLength(1);
  });
  it("only counts saved requests as finishers, not design use or contact attempts", () => {
    const result = visitorFunnels([row({ selected: 3, steps: { page_opened: 1, contact_submitted: 2 } }), row({ steps: { page_opened: 1, contact_submitted: 2, request_saved: 3 } })]);
    expect(result.overall[5].rows).toHaveLength(1);
    expect(result.overall[4].remaining).toHaveLength(1);
  });
  it("uses India midnight for today's visit filter", () => {
    expect(inIndiaToday(row({ created_at: "2026-11-08T18:30:00Z" }), new Date("2026-11-09T17:10:00Z"))).toBe(true);
    expect(inIndiaToday(row({ created_at: "2026-11-08T18:29:59Z" }), new Date("2026-11-09T17:10:00Z"))).toBe(false);
  });
});