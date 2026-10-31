import type { DirectoryManufacturer } from "@/data/directory";
import { INTAKE_QUESTION_LIMIT, INTAKE_TOPICS, validatedBrief } from "../../supabase/functions/_shared/sourcing-intake";
import type { IntakeReply, IntakeStage, SourcingBriefField } from "../../supabase/functions/_shared/sourcing-intake";

export interface SourcingMatch { id: string; reason: string }
export interface SourcingQuestion { topic: string; question: string }
export interface SourcingTurn { query: string; matches: SourcingMatch[]; questions?: SourcingQuestion[]; questionsSkipped?: boolean; images?: string[]; followUp?: "design" | "phone"; assistantMessage?: string; stage?: IntakeStage; hasRequirement?: boolean }
export interface SourcingProject { id: string; title: string; turns: SourcingTurn[]; submitted?: boolean; phone?: string; designDone?: boolean; brief?: SourcingBriefField[]; createdAt?: string }

export const BRIEF_LABELS: Record<string, string> = { format: "Packaging type / style", quantity: "Quantity / MOQ", size: "Dimensions / fill", printing: "Printing", delivery: "Delivery destination", budget: "Target price", material: "Material / board", wall: "Corrugated wall", customisation: "Customisation / inserts", finishing: "Finish", usage: "Usage", manufacturer_location: "Preferred manufacturer location", samples: "Samples", product: "Product to pack", barrier: "Barrier requirements", closure: "Closure", transparency: "Transparency", filling: "Filling method", certifications: "Certifications", shelf_life: "Shelf life / storage" };

// Confirmation-screen reading order: style, quantity, size, material, insert, finish, price, printing.
const BRIEF_ORDER = ["format", "quantity", "size", "material", "customisation", "finishing", "budget", "printing"];

export function sortSourcingBrief(fields: SourcingBriefField[]): SourcingBriefField[] {
  const rank = (topic: string) => { const index = BRIEF_ORDER.indexOf(topic); return index === -1 ? BRIEF_ORDER.length : index; };
  return [...fields].sort((a, b) => rank(a.topic) - rank(b.topic));
}

const UNCLEAR_BRIEF_WORDS = /(not\s+specified|not\s+sure|unsure|unclear|to\s+be\s+confirmed|unspecified)/i;

export function unclearBriefNotes(fields: SourcingBriefField[]): Record<string, string> {
  const notes: Record<string, string> = {};
  for (const field of fields) {
    const value = field.value.trim();
    if (UNCLEAR_BRIEF_WORDS.test(value)) { notes[field.topic] = "We’ll confirm this with you"; continue; }
    if (field.topic === "budget" && /\d/.test(value) && !/(₹|\brs\b|inr|usd|\$|€|£)/i.test(value) && !/quote/i.test(value)) notes[field.topic] = "Currency not specified — we’ll confirm";
    if (field.topic === "printing" && /^(printed|custom(ised)? printing|with printing|yes)\.?$/i.test(value)) notes[field.topic] = "Print type not specified — we’ll confirm";
  }
  return notes;
}

export function mergeSourcingBrief(previous: unknown, next: unknown): SourcingBriefField[] {
  return validatedBrief([...validatedBrief(previous), ...validatedBrief(next)]);
}

export function sourcingProjectTitle(project: SourcingProject): string {
  const brief = validatedBrief(project.brief);
  const format = brief.find(f => f.topic === "format")?.value;
  const quantity = brief.find(f => f.topic === "quantity")?.value;
  return format ? [format, quantity].filter(Boolean).join(" · ") : project.title;
}

export function validSourcingPhone(phone: string): boolean {
  return /^[+\d\s()-]+$/.test(phone.trim()) && /^\d{10,15}$/.test(phone.replace(/\D/g, ""));
}

export function looksLikeSourcingPhone(text: string): boolean {
  const trimmed = text.trim();
  return /^[+\d\s()-]+$/.test(trimmed) && trimmed.replace(/\D/g, "").length >= 8;
}

export function sourcingSubmission(turns: SourcingTurn[], phone: string, draft?: { query: string; images: string[] }, brief?: SourcingBriefField[]) {
  if (!validSourcingPhone(phone) || !turns.length) return null;
  const collected = draft && (draft.query.trim() || draft.images.length)
    ? [...turns, { query: draft.query.trim() || "Design/reference images attached", matches: [], images: draft.images }]
    : turns;
  return {
    contact: phone.trim(),
    requirement: [ ...(validatedBrief(brief).length ? ["Sourcing brief (latest captured details)\n" + validatedBrief(brief).map(f => `${BRIEF_LABELS[f.topic]}: ${f.value} [${f.source}]`).join("\n"), "Conversation:"] : []), collected.map(turn => [turn.query, ...(turn.questions ?? []).map(q => `Question: ${q.question}`), ...(turn.questionsSkipped ? ["Optional questions skipped"] : [])].join("\n")).join("\n\n") ].join("\n\n"),
    images: collected.flatMap(turn => turn.images ?? []).slice(0, 8),
    manufacturers: [],
  };
}

export function validatedMatches(value: unknown, manufacturers: DirectoryManufacturer[]): SourcingMatch[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set(manufacturers.filter(m => m.listing_status === "published").map(m => m.id));
  const seen = new Set<string>();
  return value.flatMap(item => {
    if (!item || typeof item.id !== "string" || typeof item.reason !== "string" || !allowed.has(item.id) || seen.has(item.id)) return [];
    seen.add(item.id);
    return [{ id: item.id, reason: item.reason }];
  });
}

export function sourcingRequest(turns: SourcingTurn[], query: string) {
  return [...turns.map(turn => turn.query), query].filter(Boolean).join("\nFollow-up: ").slice(0, 4000);
}

export function needsSourcingQuestions(turns: SourcingTurn[]): boolean {
  return turns.length === 0;
}

export function needsSourcingDesign(project: Pick<SourcingProject, "turns" | "designDone">): boolean {
  return !project.designDone && !project.turns.some(turn => (turn.images?.length ?? 0) > 0);
}

export function recordSourcingFollowUp(project: SourcingProject): SourcingProject {
  const current = project.turns.at(-1);
  if (!current || project.submitted || (!current.questionsSkipped && (current.questions?.length ?? 0) > 0)) return project;
  if (current.stage && !["design", "phone"].includes(current.stage)) return project;
  const followUp = current.stage === "phone" ? "phone" : needsSourcingDesign(project) ? "design" : "phone";
  if (project.turns.some(turn => turn.followUp === followUp)) return project;
  return { ...project, turns: project.turns.map((turn, i) => i === project.turns.length - 1 ? { ...turn, followUp } : turn) };
}

export async function readSourcingStream(response: Response, onQuestions: (value: unknown) => void, onReply?: (reply: IntakeReply) => void, onMessage?: (message: string) => void): Promise<unknown> {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "I couldn’t continue this conversation. Please try again.");
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("The reply was interrupted. Please try again.");
  const decoder = new TextDecoder();
  let buffer = "";
  let final: unknown;
  let completed = false;
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line);
        if (event.error) throw new Error(event.error);
        if (event.done) { final = event.questions; completed = true; if (event.stage) onReply?.(event); }
        else {
          onQuestions(event.questions);
          if (typeof event.message === "string") onMessage?.(event.message);
        }
      }
      if (done) break;
    }
    if (!completed) throw new Error("The reply was interrupted. Please try again.");
    return final;
  } finally { reader.releaseLock(); }
}

export function validatedQuestions(value: unknown, turns: SourcingTurn[]): SourcingQuestion[] {
  if (!Array.isArray(value)) return [];
  const asked = turns.flatMap(turn => turn.questions ?? []);
  const seen = new Set(asked.map(item => item.topic));
  const remaining = Math.max(0, INTAKE_QUESTION_LIMIT - asked.length);
  const allowed = new Set(INTAKE_TOPICS);
  const questions: SourcingQuestion[] = [];
  for (const item of value) {
    if (questions.length >= remaining) break;
    if (!item || typeof item.topic !== "string" || typeof item.question !== "string" || !allowed.has(item.topic) || seen.has(item.topic) || !item.question.trim()) continue;
    seen.add(item.topic);
    questions.push({ topic: item.topic, question: item.question.trim().slice(0, 200) });
  }
  return questions;
}

export function readSaved<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback; } catch { return fallback; }
}