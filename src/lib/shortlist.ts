export type ShortlistKind = "bottle" | "sachet";
export type Shortlist = { bottle: string[]; sachet: string[] };

const cacheKey = (brand: string) => `snaplogo.shortlist.${brand.toLowerCase()}`;

export const emptyShortlist: Shortlist = { bottle: [], sachet: [] };

export function readCache(brand: string): Shortlist {
  try {
    const raw = localStorage.getItem(cacheKey(brand));
    if (raw) return { ...emptyShortlist, ...(JSON.parse(raw) as Shortlist) };
    // migrate the old device-only shortlist
    const legacy = localStorage.getItem("snaplogo.shortlist");
    if (legacy) {
      const list = { bottle: JSON.parse(legacy) as string[], sachet: [] };
      // Retire the legacy key only after the brand-specific copy is safely stored.
      localStorage.setItem(cacheKey(brand), JSON.stringify(list));
      localStorage.removeItem("snaplogo.shortlist");
      return list;
    }
  } catch {
    /* ignore */
  }
  return emptyShortlist;
}

function writeCache(brand: string, list: Shortlist) {
  try {
    localStorage.setItem(cacheKey(brand), JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export async function fetchShortlist(brand: string): Promise<Shortlist> {
  // Brand names are not credentials; private server shortlists cannot be read
  // through this no-login dashboard. The device cache is authoritative.
  return readCache(brand);
}

export async function saveItem(brand: string, kind: ShortlistKind, itemId: string, on: boolean) {
  const current = readCache(brand);
  const set = new Set(current[kind]);
  if (on) set.add(itemId);
  else set.delete(itemId);
  writeCache(brand, { ...current, [kind]: [...set] });

}
