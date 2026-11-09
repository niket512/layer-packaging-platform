import type { VisitorReportRow } from "./visitor-metrics";

export type FunnelStage = { id: string; label: string; rows: VisitorReportRow[]; continued: number; remaining: VisitorReportRow[] };
type StageDefinition = { id: string; label: string; matches: (row: VisitorReportRow) => boolean };
const has = (row: VisitorReportRow, step: keyof VisitorReportRow["steps"]) => row.steps[step] !== undefined;
const formStep = (row: VisitorReportRow, step: string) => row.journey?.some(e => e.kind === "form_step" && e.step === step) === true;
const filled = (row: VisitorReportRow) => row.journey?.some(e => e.kind === "field" && e.filled && e.field !== "family" && e.step) === true;
export const startedRequest = (row: VisitorReportRow) => has(row, "first_message") || filled(row) || ["2", "3", "4"].some(step => formStep(row, step)) || ["questions_shown", "brief_shown", "contact_shown", "contact_submitted", "request_saved"].some(step => has(row, step as keyof VisitorReportRow["steps"]));

// Later stages count as continuing past an optional step, never as having viewed it.
export function buildStages(rows: VisitorReportRow[], definitions: StageDefinition[]): FunnelStage[] {
  return definitions.map((definition, index) => {
    const reached = rows.filter(definition.matches);
    const later = definitions.slice(index + 1);
    const remaining = later.length ? reached.filter(row => !later.some(stage => stage.matches(row))) : [];
    return { id: definition.id, label: definition.label, rows: reached, continued: later.length ? reached.length - remaining.length : reached.length, remaining };
  });
}
export function visitorFunnels(rows: VisitorReportRow[]) {
  const request = rows.filter(row => has(row, "page_opened"));
  const form = rows.filter(row => row.journey?.some(e => e.kind === "form_step"));
  const chat = rows.filter(row => has(row, "first_message") || row.journey?.some(e => e.kind === "page" && e.path === "/request-form") || ["questions_shown", "design_shown"].some(step => has(row, step as keyof VisitorReportRow["steps"])));
  return {
    overall: buildStages(rows, [
      { id: "visits", label: "Tracked visits", matches: () => true },
      { id: "request", label: "Opened a request page", matches: row => has(row, "page_opened") },
      { id: "started", label: "Started a request", matches: startedRequest },
      { id: "review", label: "Reached review / WhatsApp", matches: row => has(row, "brief_shown") || has(row, "contact_shown") },
      { id: "contact", label: "Submitted contact", matches: row => has(row, "contact_submitted") },
      { id: "saved", label: "Enquiry saved", matches: row => has(row, "request_saved") },
    ]),
    form: buildStages(form, [
      { id: "form1", label: "1 · Choose packaging", matches: row => formStep(row, "1") },
      { id: "form2", label: "2 · Quantity & dimensions", matches: row => formStep(row, "2") },
      { id: "form3", label: "3 · Printing & specifications", matches: row => formStep(row, "3") },
      { id: "form4", label: "4 · Review & contact", matches: row => formStep(row, "4") },
      { id: "formContact", label: "Submitted contact", matches: row => has(row, "contact_submitted") },
      { id: "formSaved", label: "Enquiry saved", matches: row => has(row, "request_saved") },
    ]),
    chat: buildStages(chat, [
      { id: "chatPage", label: "Opened chat / sent a message", matches: () => true },
      { id: "chatStart", label: "Sent first message", matches: row => has(row, "first_message") },
      { id: "chatQuestions", label: "Shown packaging questions", matches: row => has(row, "questions_shown") },
      { id: "chatAnswers", label: "Answered / skipped questions", matches: row => has(row, "questions_answered") || has(row, "questions_skipped") },
      { id: "chatDesign", label: "Shown design question", matches: row => has(row, "design_shown") },
      { id: "chatDesignAnswer", label: "Answered design question", matches: row => has(row, "design_answered") },
      { id: "chatBrief", label: "Shown packaging brief", matches: row => has(row, "brief_shown") },
      { id: "chatWhatsApp", label: "Asked for WhatsApp", matches: row => has(row, "contact_shown") },
      { id: "chatContact", label: "Submitted contact", matches: row => has(row, "contact_submitted") },
      { id: "chatSaved", label: "Enquiry saved", matches: row => has(row, "request_saved") },
    ]),
    requestCount: request.length,
    formCount: form.length,
    chatCount: chat.length,
  };
}
export function inIndiaToday(row: VisitorReportRow, now = new Date()) {
  const day = (date: Date) => date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  return day(new Date(row.created_at)) === day(now);
}