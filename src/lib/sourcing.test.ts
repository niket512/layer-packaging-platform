import { describe, expect, it } from "vitest";
import { fetchPublishedManufacturers } from "@/data/directory";
import { sourcingRequest, validatedMatches } from "./sourcing";

describe("sourcing matches", () => {
  it("only returns known published manufacturers, without duplicates", async () => {
    const manufacturers = await fetchPublishedManufacturers();
    expect(validatedMatches([{ id: "evenpack", reason: "Paper bags" }, { id: "invented", reason: "Unknown" }, { id: "evenpack", reason: "Duplicate" }], manufacturers)).toEqual([{ id: "evenpack", reason: "Paper bags" }]);
  });
  it("keeps the requirement when refining the conversation", () => {
    expect(sourcingRequest([{ query: "100 kraft paper bags", matches: [] }], "With custom printing")).toBe("100 kraft paper bags\nFollow-up: With custom printing");
  });
});