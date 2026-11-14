import { beforeEach, describe, expect, it, vi } from "vitest";

const { from } = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from } }));

import { fetchShortlist, readCache, saveItem } from "./shortlist";

beforeEach(() => {
  localStorage.clear();
  from.mockReset();
});

describe("device-local dashboard shortlist", () => {
  it("keeps both saved families across repeated dashboard loads without server reads", async () => {
    await saveItem("Brand", "bottle", "bottle-1", true);
    await saveItem("Brand", "sachet", "sachet-1", true);
    for (let load = 0; load < 3; load++) {
      expect(await fetchShortlist("BRAND")).toEqual({ bottle: ["bottle-1"], sachet: ["sachet-1"] });
    }
    expect(from).not.toHaveBeenCalled();
  });

  it.each(["bottle", "sachet"] as const)("persists removal of a %s without a denied server delete", async (kind) => {
    await saveItem("Brand", kind, "design-1", true);
    await saveItem("Brand", kind, "design-1", false);
    expect((await fetchShortlist("Brand"))[kind]).toEqual([]);
    expect(from).not.toHaveBeenCalled();
  });

  it("migrates legacy bottles once and never restores a removed legacy design", async () => {
    localStorage.setItem("snaplogo.shortlist", JSON.stringify(["legacy-1"]));
    expect(readCache("Brand")).toEqual({ bottle: ["legacy-1"], sachet: [] });
    expect(localStorage.getItem("snaplogo.shortlist")).toBeNull();
    await saveItem("Brand", "bottle", "legacy-1", false);
    expect(await fetchShortlist("Brand")).toEqual({ bottle: [], sachet: [] });
    expect(readCache("Other brand")).toEqual({ bottle: [], sachet: [] });
  });

  it("keeps different brands separate and repeated saves unique", async () => {
    await saveItem("Brand", "bottle", "design-1", true);
    await saveItem("Brand", "bottle", "design-1", true);
    expect(readCache("Brand").bottle).toEqual(["design-1"]);
    expect(readCache("Other brand")).toEqual({ bottle: [], sachet: [] });
  });
});