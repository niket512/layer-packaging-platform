import entries from "@/data/manufacturer-network.json";
import publishedContacts from "@/data/manufacturer-contacts.json";
import pouchEntries from "@/data/pouch-manufacturer-network.json";

type PublishedContact = { phone?: string; whatsapp?: string };
const contacts: Record<string, PublishedContact> = publishedContacts;
export function manufacturerContact(name: string) {
  const supplied = pouchEntries.find(entry => entry.company_name === name)?.phone;
  const contact = supplied ? { phone: supplied } : contacts[name];
  const primaryPhone = contact?.phone?.split(/[;,|]/)[0]?.trim();
  const digits = primaryPhone?.replace(/[^\d+]/g, "") ?? "";
  let whatsapp: string | undefined;
  try {
    const url = new URL(contact?.whatsapp ?? "");
    if (url.protocol === "https:" && ["wa.me", "api.whatsapp.com", "www.whatsapp.com"].includes(url.hostname)) whatsapp = url.href;
  } catch { /* No explicitly published WhatsApp link. */ }
  const dialNumber = /^\d{10}$/.test(digits) ? `+91${digits}` : digits;
  if (!whatsapp && /^\+?\d{10,15}$/.test(dialNumber)) {
    whatsapp = `https://wa.me/${dialNumber.replace(/^\+/, "")}`;
  }
  return { phone: primaryPhone, tel: /^\+?\d{10,15}$/.test(dialNumber) ? `tel:${dialNumber}` : undefined, whatsapp };
}

export function listingDensity(count: number): "none" | "low" | "medium" | "high" | "highest" {
  if (count <= 0) return "none";
  if (count <= 3) return "low";
  if (count <= 8) return "medium";
  if (count <= 15) return "high";
  return "highest";
}

export type NetworkManufacturer = (typeof entries)[number] & {
  location_label?: string; phone?: string; catalogue_url?: string; family?: string; business_type?: string;
};
const merged = new Map<string, NetworkManufacturer>();
const companyKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
for (const entry of [...entries, ...pouchEntries]) {
  if (!entry.company_name.trim()) continue;
  const key = companyKey(entry.company_name);
  const previous = merged.get(key);
  merged.set(key, previous ? { ...previous, ...entry, address: entry.address || previous.address } : entry);
}
export const networkManufacturers = [...merged.values()];
export const networkStates = [...new Set(networkManufacturers.map(entry => entry.state).filter(Boolean))].sort();
export const pouchTypes = ["Stand-up", "Zipper", "Spout", "Flat-bottom", "Side-gusset", "Three-side-seal", "Rollstock"];
export function isPouchManufacturer(entry: NetworkManufacturer) {
  return entry.family === "pouches" || /pouch|flexible|laminate|rollstock/i.test(entry.products_and_capabilities);
}
export function filterNetwork(query: string, state: string, family = "", pouchType = "", contactsOnly = false) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return networkManufacturers.filter(entry => (!state || entry.state === state)
    && (!family || (family === "pouches" ? isPouchManufacturer(entry) : /corrugated|cardboard|carton|box/i.test(entry.products_and_capabilities)))
    && (!pouchType || entry.products_and_capabilities.toLowerCase().replace(/3-side/g, "three-side").includes(pouchType.toLowerCase()))
    && (!contactsOnly || !!manufacturerContact(entry.company_name).whatsapp)
    && words.every(word => [entry.company_name, entry.legal_name_or_brand, entry.city, entry.state, entry.location_label, entry.products_and_capabilities].join(" ").toLowerCase().includes(word)));
}