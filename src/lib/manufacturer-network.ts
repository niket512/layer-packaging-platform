import entries from "@/data/manufacturer-network.json";

export type NetworkManufacturer = (typeof entries)[number];
export const networkManufacturers = entries.filter(entry => entry.company_name.trim());
export const networkStates = [...new Set(networkManufacturers.map(entry => entry.state).filter(Boolean))].sort();
export function filterNetwork(query: string, state: string, source: string) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return networkManufacturers.filter(entry => (!state || entry.state === state)
    && (!source || entry.verification_status === source)
    && words.every(word => [entry.company_name, entry.legal_name_or_brand, entry.city, entry.state, entry.products_and_capabilities].join(" ").toLowerCase().includes(word)));
}
export function sourceLinks(entry: NetworkManufacturer) {
  return [...new Set([entry.website, ...entry.source_urls.split(/\s*\|\s*/)].filter(url => {
    try { return new URL(url).protocol === "https:" || new URL(url).protocol === "http:"; } catch { return false; }
  }))];
}