import type { JourneyEvent, VisitorReportRow } from "./visitor-metrics";

export const ADMIN_FIELD_LABELS: Record<string, string> = {
  family: "Packaging type", format: "Box type", quantity: "Quantity", size: "Box dimensions",
  printing: "Printing", material: "Material", wall: "Board strength", closure: "Closure",
  finishing: "Finishing", delivery: "Delivery city / PIN", notes: "Message / Project Details",
  phone: "WhatsApp number", photos: "Reference images",
};
export const ADMIN_FORM_STEPS = ["Box type", "Project details", "Contact & submit"];
const actions: Record<string, string> = {
  page_opened: "Request page opened", category_selected: "Packaging selected",
  composer_focused: "Chat input opened", first_message: "First message sent",
  questions_shown: "Packaging questions displayed", questions_answered: "Packaging questions answered",
  questions_skipped: "Packaging questions skipped", design_shown: "Design question displayed",
  design_answered: "Design question answered", brief_shown: "Packaging brief displayed",
  contact_shown: "WhatsApp field displayed", contact_submitted: "Contact submitted",
  request_saved: "Enquiry saved",
};
const pages: Record<string, string> = {
  "/": "Box enquiry form", "/request-form": "Sourcing chat", "/sourcing": "Sourcing request",
  "/designs": "Design catalogue", "/designs/flexible-pouches": "Pouch catalogue",
  "/designs/corrugated-boxes": "Box catalogue",
};
export const adminPageLabel = (path: string) => pages[path] ?? path;
export function adminJourneyLabel(event: JourneyEvent) {
  if (event.kind === "page") return `Opened ${adminPageLabel(event.path)}`;
  if (event.kind === "form_step") {
    // Untagged steps cannot reliably identify the form's historical field order.
    const name = event.category === "form-v2-2step" ? ["Box type", "Project details & contact"][Number(event.step) - 1] : event.category === "form-v2" ? ADMIN_FORM_STEPS[Number(event.step) - 1] : undefined;
    return `Form step ${event.step}${name ? ` · ${name}` : ""}`;
  }
  if (event.kind === "field") return `${event.filled ? "Filled" : "Cleared"} ${ADMIN_FIELD_LABELS[event.field ?? ""] ?? "field"}`;
  if (event.kind === "form_error") return event.reason === "format_required" ? "Box type required" : event.reason === "phone_invalid" ? "WhatsApp number needs correction" : event.reason === "details_invalid" ? "Project details need correction" : "Enquiry could not be saved";
  if (event.kind === "funnel") return actions[event.step ?? ""] ?? (event.step ?? "").replace(/_/g, " ");
  return event.kind === "viewed" ? "Catalogue card viewed" : event.kind === "opened" ? "Design details opened" : "Design used";
}
export function lastSessionAction(row: VisitorReportRow) {
  const last = row.journey?.at(-1);
  if (last) return adminJourneyLabel(last);
  const step = Object.entries(row.steps).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0];
  return step ? actions[step] ?? step.replace(/_/g, " ") : "Catalogue browsing";
}