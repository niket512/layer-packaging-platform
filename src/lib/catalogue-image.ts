import optimized from "@/data/catalogue-image-urls.json";

/** Use cached, resized catalogue photographs without changing catalogue records. */
export function catalogueImage(source: string, thumbnail = false): string {
  const cached = (optimized as Record<string, string>)[source];
  if (cached) return cached;
  if (thumbnail && /^\/sachets\/[^/]+\.jpg$/.test(source)) {
    return source.replace("/sachets/", "/sachets/thumb/").replace(/\.jpg$/, ".webp");
  }
  return source;
}