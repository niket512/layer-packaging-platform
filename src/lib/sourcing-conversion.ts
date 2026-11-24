export const SOURCING_LEAD_EVENT = "sourcing_lead_submitted";

/** Emits a tag-manager-ready signal, not a Google Ads conversion by itself. */
export function createSourcingLeadTracker(emit: (event: { event: string; lead_id: string }) => void) {
  const recorded = new Set<string>();
  return (leadId: string, saved: boolean) => {
    if (!saved || !leadId || recorded.has(leadId)) return false;
    recorded.add(leadId);
    emit({ event: SOURCING_LEAD_EVENT, lead_id: leadId });
    return true;
  };
}

export const recordSourcingLead = createSourcingLeadTracker(event => {
  const target = window as Window & { dataLayer?: unknown[] };
  target.dataLayer = target.dataLayer ?? [];
  target.dataLayer.push(event);
});

const PENDING = "snaplogo.conversion.pending";
const FIRED = "snaplogo.conversion.fired";
/** Called right after an enquiry is saved; the thank-you page fires conversions only for this pending ID. */
export function markConversionPending(leadId: string, storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> = localStorage) {
  try { storage.setItem(PENDING, leadId); } catch { /* conversion may be missed, enquiry is saved */ }
}
/** Returns true once per saved enquiry; refreshes and revisits of the thank-you page return false. */
export function consumeConversion(leadId: string | undefined, storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> = localStorage) {
  if (!leadId) return false;
  try {
    const fired: string[] = JSON.parse(storage.getItem(FIRED) ?? "[]");
    const pending = storage.getItem(PENDING);
    storage.removeItem(PENDING);
    if (pending !== leadId || fired.includes(leadId)) return false;
    storage.setItem(FIRED, JSON.stringify([...fired, leadId].slice(-50)));
    return true;
  } catch { return false; }
}