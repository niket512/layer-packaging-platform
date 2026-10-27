import { describe, expect, it } from "vitest";
import { fetchPublishedManufacturers } from "@/data/directory";
import { sourcingRequest, sourcingSubmission, validSourcingPhone, validatedMatches, validatedQuestions } from "./sourcing";
import { CORRUGATED_REQUIREMENTS } from "../../supabase/functions/_shared/sourcing-intake";

describe("sourcing matches", () => {
  it("requires a valid phone number for follow-up", () => {
    expect(validSourcingPhone("+91 98765 43210")).toBe(true);
    expect(validSourcingPhone("123")).toBe(false);
    expect(validSourcingPhone("call me 9876543210")).toBe(false);
    expect(sourcingSubmission([{ query: "Paper bags", matches: [] }], "")).toBeNull();
  });
  it("saves answers and phone without suggesting suppliers", () => {
    expect(sourcingSubmission([{ query: "Paper bags", matches: [{ id: "evenpack", reason: "Legacy match" }], questions: [{ topic: "quantity", question: "How many?" }] }, { query: "500 units", matches: [] }], "+91 98765 43210")).toEqual({ contact: "+91 98765 43210", requirement: "Paper bags\nQuestion: How many?\n\n500 units", images: [], manufacturers: [] });
  });
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
describe("sourcing photos", () => {
  it("sends photos shared in the chat with the request, up to eight", () => {
    const turns = [{ query: "Bags", matches: [], images: Array(10).fill("data:image/jpeg;base64,x") }];
    expect(sourcingSubmission(turns, "+91 98765 43210")?.images).toHaveLength(8);
  });
});

describe("corrugated-box requirement configuration", () => {
  it.each([
    ["format", ["Shipping", "Mailer", "Die-cut", "Printed", "Tray"]],
    ["wall", ["3-ply", "5-ply", "7-ply"]],
    ["printing", ["No printing", "Single-colour", "Multicolour", "Digital printing"]],
    ["material", ["Kraft liner", "White-top liner", "Other available board grades"]],
    ["size", ["Length × width × height (include units)"]],
    ["quantity", ["100–500", "500–1,000", "1,000–5,000", "5,000+"]],
    ["customisation", ["Custom size", "Printing", "Inserts", "Partitions"]],
    ["finishing", ["Lamination", "Coating", "Special finishes, where compatible"]],
    ["usage", ["Shipping", "Retail", "Gifting", "Storage", "Product protection"]],
    ["manufacturer_location", ["City and state"]],
    ["budget", ["Target price per box", "Quote-based pricing"]],
    ["samples", ["Available", "Not available"]],
  ])("supports the supplied %s requirement choices", (topic, options) => {
    expect(CORRUGATED_REQUIREMENTS.find(field => field.topic === topic)?.options).toEqual(options);
  });
  it.each(["wall", "customisation", "finishing", "usage", "manufacturer_location", "samples"])("accepts %s questions without repeating them", topic => {
    const question = { topic, question: "What is your preference?" };
    expect(validatedQuestions([question], [])).toEqual([question]);
    expect(validatedQuestions([question], [{ query: "Corrugated boxes", matches: [], questions: [question] }])).toEqual([]);
  });
  it("keeps the two-question limit for corrugated topics", () => {
    expect(validatedQuestions(["wall", "samples", "usage"].map(topic => ({ topic, question: "Your preference?" })), [])).toHaveLength(2);
  });
});
