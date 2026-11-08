import entries from "@/data/manufacturer-network.json";
import publishedContacts from "@/data/manufacturer-contacts.json";

type PublishedContact = { phone?: string; whatsapp?: string };
const contacts: Record<string, PublishedContact> = publishedContacts;
export function manufacturerContact(name: string) {
  const contact = contacts[name];
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

export type NetworkManufacturer = (typeof entries)[number];
export const networkManufacturers = entries.filter(entry => entry.company_name.trim());
export const networkStates = [...new Set(networkManufacturers.map(entry => entry.state).filter(Boolean))].sort();
export function filterNetwork(query: string, state: string) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return networkManufacturers.filter(entry => (!state || entry.state === state)
    && words.every(word => [entry.company_name, entry.legal_name_or_brand, entry.city, entry.state, entry.products_and_capabilities].join(" ").toLowerCase().includes(word)));
}