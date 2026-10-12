export type ManufacturerProfile = {
  /** Must match the manufacturer name used in the catalogue data */
  name: string;
  category: "bottles" | "sachets";
  location?: string;
  established?: string;
  capabilities: string[];
  /** Brands this manufacturer has produced for. Empty until shared by the supplier. */
  brands: string[];
  note?: string;
};

// Listing refreshed — all profiles removed pending updated entries.
export const manufacturerProfiles: ManufacturerProfile[] = [];
