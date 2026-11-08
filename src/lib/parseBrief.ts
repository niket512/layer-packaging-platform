export type BriefField = "product" | "quantity" | "material" | "city";
export type RequestBrief = Partial<Record<BriefField, string>>;
export const briefFields: BriefField[] = ["product", "quantity", "material", "city"];
export const fieldLabels: Record<BriefField, string> = { product: "Product", quantity: "Quantity", material: "Material", city: "Delivery city" };
export const questions: Record<BriefField, string> = { product: "What are you packaging?", quantity: "How many would you like to order?", material: "Which material do you prefer?", city: "Which city should we deliver to?" };
export const choices: Record<BriefField, string[]> = { product: ["Mono cartons", "Corrugated boxes", "Pouches", "Rigid boxes", "Labels"], quantity: ["1,000", "5,000", "10,000", "25,000+"], material: ["Kraft", "Duplex board", "Corrugated", "Not sure yet"], city: ["Mumbai", "Delhi NCR", "Pune", "Chennai"] };

export function parseBrief(text: string, field?: BriefField): RequestBrief {
  const result: RequestBrief = {};
  const lower = text.toLowerCase().trim();
  const products: [RegExp, string][] = [[/mono\s*cartons?/, "Mono cartons"], [/corrugated\s*box(?:es)?|shipping\s*box(?:es)?|mailer\s*box(?:es)?/, "Corrugated boxes"], [/pouch(?:es)?|sachets?/, "Pouches"], [/rigid\s*box(?:es)?/, "Rigid boxes"], [/labels?|stickers?/, "Labels"]];
  result.product = products.find(([pattern]) => pattern.test(lower))?.[1];
  const number = lower.match(/\b(\d[\d,]*(?:\.\d+)?)\s*(lakh|lakhs|k)?\s*(\+)?/);
  if (number) {
    const value = Number(number[1].replace(/,/g, "")) * (number[2]?.startsWith("lakh") ? 100000 : number[2] === "k" ? 1000 : 1);
    if (value > 0 && Number.isFinite(value)) result.quantity = value.toLocaleString("en-IN") + (number[3] ? "+" : "");
  }
  const cities: [RegExp, string][] = [[/\bmumbai\b/, "Mumbai"], [/\b(delhi(?: ncr)?|noida|gurugram|ghaziabad)\b/, "Delhi NCR"], [/\bpune\b/, "Pune"], [/\bchennai\b/, "Chennai"], [/\b(bengaluru|bangalore)\b/, "Bengaluru"], [/\bhyderabad\b/, "Hyderabad"], [/\bkolkata\b/, "Kolkata"], [/\bahmedabad\b/, "Ahmedabad"]];
  result.city = cities.find(([pattern]) => pattern.test(lower))?.[1];
  if (/\bkraft\b/.test(lower)) result.material = "Kraft";
  else if (/\bduplex(?: board)?\b/.test(lower)) result.material = "Duplex board";
  else if (/not sure|unsure|don't know/.test(lower)) result.material = "Not sure yet";
  else if (field === "material" && /^corrugated$/i.test(text.trim())) result.material = "Corrugated";
  if (field === "city" && !result.city && /^[a-zA-Z][a-zA-Z .'-]{2,59}$/.test(text.trim()) && !/^(ww+|nothing|no|hello|hi|test|asdf|unknown)$/i.test(text.trim())) result.city = text.trim();
  return Object.fromEntries(Object.entries(result).filter(([, value]) => value));
}

export function validateRequestFile(file: Pick<File, "size" | "name" | "type">): string | undefined {
  if (file.size > 10 * 1024 * 1024) return "File is too large. The limit is 10 MB.";
  if (!/\.(png|jpe?g|webp|gif|pdf|ai)$/i.test(file.name)) return "This format isn't supported. Use PNG, JPG, PDF or AI.";
}