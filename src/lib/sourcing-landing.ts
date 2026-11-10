export type LandingFamily = "boxes" | "pouches";

// Search engines do not reliably share search terms. Use the destination page
// or an explicit campaign parameter rather than guessing from the referrer.
export function sourcingLandingFamily(category?: string, search = ""): LandingFamily {
  if (category) return category === "flexible-pouches" || category === "sachets" ? "pouches" : "boxes";
  const requested = new URLSearchParams(search).get("category");
  return requested === "pouches" || requested === "flexible-pouches" || requested === "sachets" ? "pouches" : "boxes";
}