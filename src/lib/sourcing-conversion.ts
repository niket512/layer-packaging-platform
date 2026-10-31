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