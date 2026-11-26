import { usableRedditClickId } from "@/lib/reddit-click-id";

export function readRedditClickId(storage: Pick<Storage, "getItem" | "removeItem">): string | undefined {
  try {
    const saved = storage.getItem("rdt_cid");
    const clickId = usableRedditClickId(saved);
    if (saved !== null && !clickId) storage.removeItem("rdt_cid");
    return clickId;
  } catch {
    return undefined;
  }
}