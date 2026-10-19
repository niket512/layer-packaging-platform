import type { DirectoryManufacturer } from "@/data/directory";

export interface SourcingMatch { id: string; reason: string }
export interface SourcingTurn { query: string; matches: SourcingMatch[] }
export interface SourcingProject { id: string; title: string; turns: SourcingTurn[] }

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
  return [...turns.map(turn => turn.query), query].join("\nFollow-up: ").slice(-500);
}

export function readSaved<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback; } catch { return fallback; }
}