export type LandingFamily = "boxes" | "pouches";

// Google Ads can supply its matched keyword through keyword={keyword}.
// Organic Google search terms and opaque click IDs cannot identify a family.
export function sourcingLandingFamily(category?: string, search = ""): LandingFamily {
  if (category) return category === "flexible-pouches" || category === "sachets" ? "pouches" : "boxes";
  const params = new URLSearchParams(search);
  const requested = params.get("category");
  if (requested === "pouches" || requested === "flexible-pouches" || requested === "sachets") return "pouches";
  if (requested === "boxes" || requested === "corrugated-boxes" || requested === "mailer-boxes") return "boxes";
  const keyword = (params.get("keyword") ?? params.get("utm_term") ?? "").slice(0, 500).toLowerCase();
  const pouch = /\b(?:pouch(?:es)?|sachets?|stick[\s-]*packs?)\b/.test(keyword);
  const box = /\b(?:box(?:es)?|corrugated|mailers?)\b/.test(keyword);
  return pouch && !box ? "pouches" : "boxes";
}