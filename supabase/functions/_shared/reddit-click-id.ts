/** Reddit IDs are opaque: preserve genuine URL values, never fabricate a match key. */
export function usableRedditClickId(value: unknown): string | undefined {
  if (typeof value !== "string" || !value || value.length > 500 || /\s/.test(value)) return undefined;
  // This placeholder was used in the live integration test and is not a Reddit ad click.
  if (value.toLowerCase() === "lovable_test_click") return undefined;
  return value;
}

export function redditClickMatch(value: unknown): { click_id?: string } {
  const clickId = usableRedditClickId(value);
  return clickId ? { click_id: clickId } : {};
}