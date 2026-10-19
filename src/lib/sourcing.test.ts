import { describe, expect, it } from "vitest";
import { fetchPublishedManufacturers } from "@/data/directory";
import { sourcingRequest, validatedMatches, validatedQuestions } from "./sourcing";

describe("sourcing matches", () => {
  it("only returns known published manufacturers, without duplicates", async () => {
    const manufacturers = await fetchPublishedManufacturers();
    expect(validatedMatches([{ id: "evenpack", reason: "Paper bags" }, { id: "invented", reason: "Unknown" }, { id: "evenpack", reason: "Duplicate" }], manufacturers)).toEqual([{ id: "evenpack", reason: "Paper bags" }]);
  });
  it("keeps the requirement when refining the conversation", () => {
    expect(sourcingRequest([{ query: "100 kraft paper bags", matches: [] }], "With custom printing")).toBe("100 kraft paper bags\nFollow-up: With custom printing");
  });
  it("asks no more than two focused questions in a sourcing conversation", () => {
    expect(validatedQuestions([{ topic: "quantity", question: "How many packs?" }, { topic: "size", question: "What size?" }, { topic: "printing", question: "Custom printing?" }], [])).toHaveLength(2);
  });
  it("does not repeat topics already asked, including skipped questions", () => {
    expect(validatedQuestions([{ topic: "quantity", question: "How many?" }, { topic: "delivery", question: "Which city?" }], [{ query: "Pouches", matches: [], questions: [{ topic: "quantity", question: "How many packs?" }], questionsSkipped: true }])).toEqual([{ topic: "delivery", question: "Which city?" }]);
  });
  it("stops asking after two questions", () => {
    expect(validatedQuestions([{ topic: "budget", question: "Budget?" }], [{ query: "Bags", matches: [], questions: [{ topic: "quantity", question: "How many?" }, { topic: "size", question: "What size?" }] }])).toEqual([]);
  });
  it("retains the initial details in longer conversations", () => {
    expect(sourcingRequest([{ query: "500 paper bags for Chennai", matches: [] }], "Custom printing ".repeat(40))).toContain("500 paper bags for Chennai");
  });
});