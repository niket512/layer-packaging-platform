import type { SourcingTurn } from "@/lib/sourcing";
import type { SourcingBriefField } from "../../supabase/functions/_shared/sourcing-intake";

export type AnalysedChat = { status: string; contact: string | null; created_at: string; updated_at: string; transcript: SourcingTurn[]; brief: SourcingBriefField[]; images?: string[]; cataloguesViewed?: number; designsUsed?: number };

export function chatStats(chat: AnalysedChat) {
  const messages = chat.transcript.length;
  const photos = chat.transcript.reduce((n, t) => n + (t.images?.length ?? 0), 0) + (chat.images?.length ?? 0);
  const questions = chat.transcript.reduce((n, t) => n + (t.questions?.length ?? 0), 0);
  const minutes = Math.max(0, Math.round((Date.parse(chat.updated_at) - Date.parse(chat.created_at)) / 60000));
  const lastStage = chat.status === "submitted" ? "submitted" : [...chat.transcript].reverse().find(t => t.followUp)?.followUp === "phone" ? "asked for phone" : [...chat.transcript].reverse().find(t => t.followUp)?.followUp === "design" ? "asked for design" : questions ? "answering questions" : "first message";
  const format = chat.brief.find(f => f.topic === "format")?.value.trim() || "Not captured";
  return { messages, photos, questions, minutes, briefFields: chat.brief.length, lastStage, format, hasContact: !!chat.contact };
}

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const tally = (values: string[]) => Object.entries(values.reduce<Record<string, number>>((m, v) => ({ ...m, [v]: (m[v] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]);

export function summariseChats(chats: AnalysedChat[]) {
  const stats = chats.map(chatStats);
  const total = chats.length;
  const submitted = chats.filter(c => c.status === "submitted").length;
  const avg = (key: "messages" | "minutes" | "briefFields") => (total ? Math.round((stats.reduce((n, s) => n + s[key], 0) / total) * 10) / 10 : 0);
  const days = new Map<string, number>();
  for (let i = 13; i >= 0; i--) days.set(new Date(Date.now() - i * 864e5).toISOString().slice(0, 10), 0);
  chats.forEach(c => { const d = c.created_at.slice(0, 10); if (days.has(d)) days.set(d, days.get(d)! + 1); });
  const hours = Array.from({ length: 24 }, () => 0);
  chats.forEach(c => { hours[new Date(c.created_at).getHours()]++; });
  const withCatalogue = chats.filter(c => c.cataloguesViewed !== undefined);
  return {
    total, submitted, ongoing: total - submitted, conversion: pct(submitted, total),
    withContact: stats.filter(s => s.hasContact).length, withPhotos: stats.filter(s => s.photos > 0).length,
    cataloguesViewed: withCatalogue.reduce((n, c) => n + (c.cataloguesViewed ?? 0), 0),
    designsUsed: withCatalogue.reduce((n, c) => n + (c.designsUsed ?? 0), 0),
    catalogueLinked: withCatalogue.length,
    avgMessages: avg("messages"), avgMinutes: avg("minutes"), avgBrief: avg("briefFields"),
    stages: tally(stats.map(s => s.lastStage)), formats: tally(stats.map(s => s.format)).slice(0, 8),
    topics: tally(chats.flatMap(c => c.brief.map(f => f.topic))).slice(0, 10),
    perDay: [...days.entries()], perHour: hours,
  };
}
