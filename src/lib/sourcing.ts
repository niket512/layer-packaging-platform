import type { DirectoryManufacturer } from "@/data/directory";
import { INTAKE_QUESTION_LIMIT, INTAKE_TOPICS } from "../../supabase/functions/_shared/sourcing-intake";

export interface SourcingMatch { id: string; reason: string }
export interface SourcingQuestion { topic: string; question: string }
export interface SourcingTurn { query: string; matches: SourcingMatch[]; questions?: SourcingQuestion[]; questionsSkipped?: boolean; images?: string[] }
export interface SourcingProject { id: string; title: string; turns: SourcingTurn[]; submitted?: boolean; phone?: string; designDone?: boolean }

export function validSourcingPhone(phone: string): boolean {
  return /^[+\d\s()-]+$/.test(phone.trim()) && /^\d{10,15}$/.test(phone.replace(/\D/g, ""));
}

export function sourcingSubmission(turns: SourcingTurn[], phone: string, draft?: { query: string; images: string[] }) {
  if (!validSourcingPhone(phone) || !turns.length) return null;
  const collected = draft && (draft.query.trim() || draft.images.length)
    ? [...turns, { query: draft.query.trim() || "Design/reference images attached", matches: [], images: draft.images }]
    : turns;
  return {
    contact: phone.trim(),
    requirement: collected.map(turn => [turn.query, ...(turn.questions ?? []).map(q => `Question: ${q.question}`), ...(turn.questionsSkipped ? ["Optional questions skipped"] : [])].join("\n")).join("\n\n"),
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

export async function readSourcingStream(response: Response, onQuestions: (value: unknown) => void): Promise<unknown> {
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
        if (event.done) { final = event.questions; completed = true; }
        else onQuestions(event.questions);
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