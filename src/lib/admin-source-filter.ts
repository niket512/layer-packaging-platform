export const ADMIN_SOURCES = [
  ["all", "All sources"], ["paid_search", "Google / paid search"],
  ["organic_search", "Organic search"], ["direct", "Direct"],
  ["social", "Social"], ["referral", "Referral"], ["email", "Email"],
  ["other_campaign", "Other campaign"], ["unknown", "Source not recorded"],
] as const;
export function matchesAdminSource(source: string | null | undefined, filter: string) {
  return filter === "all" || (source || "unknown") === filter;
}