import { supabase } from "@/integrations/supabase/client";

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
    if (legacy) return { bottle: JSON.parse(legacy) as string[], sachet: [] };
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
  const { data, error } = await supabase
    .from("shortlist_items")
    .select("item_id, kind")
    .eq("brand", brand.toLowerCase());
  if (error || !data) return readCache(brand);
  const list: Shortlist = { bottle: [], sachet: [] };
  for (const row of data) {
    const kind = (row.kind === "sachet" ? "sachet" : "bottle") as ShortlistKind;
    list[kind].push(row.item_id);
  }
  writeCache(brand, list);
  return list;
}

export async function saveItem(brand: string, kind: ShortlistKind, itemId: string, on: boolean) {
  const current = readCache(brand);
  const set = new Set(current[kind]);
  if (on) set.add(itemId);
  else set.delete(itemId);
  writeCache(brand, { ...current, [kind]: [...set] });

  const key = brand.toLowerCase();
  if (on) {
    await supabase.from("shortlist_items").upsert(
      { brand: key, item_id: itemId, kind },
      { onConflict: "brand,item_id" },
    );
  } else {
    await supabase.from("shortlist_items").delete().eq("brand", key).eq("item_id", itemId);
  }
}

/** Push a device-only shortlist to the account once, after sign-in. */
export async function syncLocalToAccount(brand: string, ids: string[]) {
  if (!ids.length) return;
  await supabase.from("shortlist_items").upsert(
    ids.map((item_id) => ({ brand: brand.toLowerCase(), item_id, kind: "bottle" })),
    { onConflict: "brand,item_id" },
  );
}
