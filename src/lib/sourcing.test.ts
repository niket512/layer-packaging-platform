import { describe, expect, it } from "vitest";
import { fetchPublishedManufacturers } from "@/data/directory";
import { looksLikeSourcingPhone, needsSourcingDesign, needsSourcingQuestions, readSourcingStream, sourcingRequest, sourcingSubmission, validSourcingPhone, validatedMatches, validatedQuestions } from "./sourcing";
import { CORRUGATED_REQUIREMENTS, FLEXIBLE_REQUIREMENTS, intakeImageParts, INTAKE_QUESTION_LIMIT } from "../../supabase/functions/_shared/sourcing-intake";

describe("sourcing matches", () => {
  it("treats five as a ceiling and preserves fewer quotation questions", () => {
    expect(INTAKE_QUESTION_LIMIT).toBe(5);
    const questions = [{ topic: "printing", question: "What printing is needed?" }, { topic: "finishing", question: "What finish is needed?" }];
    expect(validatedQuestions(questions, [])).toEqual(questions);
  });
  it("rejects routine first-batch timeline questions without dropping quotation details", () => {
    const printing = { topic: "printing", question: "What printing is needed on the box and sleeve?" };
    expect(validatedQuestions([printing, { topic: "timeline", question: "When would you need the first batch delivered?" }], [])).toEqual([printing]);
  });
  it("requires a valid phone number for follow-up", () => {
    expect(validSourcingPhone("+91 98765 43210")).toBe(true);
    expect(validSourcingPhone("123")).toBe(false);
    expect(validSourcingPhone("call me 9876543210")).toBe(false);
    expect(sourcingSubmission([{ query: "Paper bags", matches: [] }], "")).toBeNull();
  });
  it("treats digit-only chat replies at the phone step as phone attempts", () => {
    expect(looksLikeSourcingPhone("98765 432")).toBe(true);
    expect(looksLikeSourcingPhone("+91 98765 43210")).toBe(true);
    expect(looksLikeSourcingPhone("I need matte finish, 5000 pcs")).toBe(false);
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
  it("accepts four or five missing-detail questions together, but not six", () => {
    const questions = ["quantity", "size", "printing", "wall", "usage", "budget"].map(topic => ({ topic, question: "Your preference?" }));
    expect(validatedQuestions(questions.slice(0, 4), [])).toHaveLength(4);
    expect(validatedQuestions(questions, [])).toHaveLength(5);
  });
  it("does not repeat topics already asked, including skipped questions", () => {
    expect(validatedQuestions([{ topic: "quantity", question: "How many?" }, { topic: "delivery", question: "Which city?" }], [{ query: "Pouches", matches: [], questions: [{ topic: "quantity", question: "How many packs?" }], questionsSkipped: true }])).toEqual([{ topic: "delivery", question: "Which city?" }]);
  });
  it("stops asking after five questions", () => {
    expect(validatedQuestions([{ topic: "budget", question: "Budget?" }], [{ query: "Bags", matches: [], questions: ["quantity", "size", "printing", "material", "delivery"].map(topic => ({ topic, question: "Your preference?" })) }])).toEqual([]);
  });
  it("counts earlier questions against the five-question budget", () => {
    expect(validatedQuestions(["wall", "samples", "usage", "budget"].map(topic => ({ topic, question: "Your preference?" })), [{ query: "Boxes", matches: [], questions: ["quantity", "size"].map(topic => ({ topic, question: "Your preference?" })) }])).toHaveLength(3);
  });
  it("retains the initial details in longer conversations", () => {
    expect(sourcingRequest([{ query: "500 paper bags for Chennai", matches: [] }], "Custom printing ".repeat(40))).toContain("500 paper bags for Chennai");
  });
});
describe("sourcing photos", () => {
  it("skips asking for a design already attached to the first request", () => {
    expect(needsSourcingDesign({ turns: [{ query: "Custom boxes", matches: [], images: ["data:image/jpeg;base64,eA=="] }] })).toBe(false);
    expect(needsSourcingDesign({ turns: [{ query: "Custom boxes", matches: [] }] })).toBe(true);
  });
  it("completes design collection from a sent chat image or optional design reply", () => {
    expect(needsSourcingDesign({ turns: [{ query: "Boxes", matches: [] }, { query: "My design", matches: [], images: ["data:image/jpeg;base64,eA=="] }] })).toBe(false);
    expect(needsSourcingDesign({ turns: [{ query: "No design yet", matches: [] }], designDone: true })).toBe(false);
  });
  it("passes initial designs as image parts for AI analysis, retaining their actual MIME", () => {
    const image = "data:image/png;base64,eA==";
    expect(intakeImageParts([image])).toEqual([{ type: "image", image: new URL(image) }]);
    expect(intakeImageParts(undefined)).toEqual([]);
    expect(() => intakeImageParts(["https://example.com/image.png"])).toThrow("valid image");
    expect(() => intakeImageParts(["data:image/png;base64,"])).toThrow("valid image");
  });
  it("includes pending design images and remaining details when a WhatsApp number is submitted", () => {
    const payload = sourcingSubmission([{ query: "500 boxes", matches: [] }], "+91 98765 43210", { query: "Matte finish, foam insert", images: ["data:image/jpeg;base64,design"] });
    expect(payload?.requirement).toBe("500 boxes\n\nMatte finish, foam insert");
    expect(payload?.images).toEqual(["data:image/jpeg;base64,design"]);
    expect(payload?.contact).toBe("+91 98765 43210");
  });
  it("sends photos shared in the chat with the request, up to eight", () => {
    const turns = [{ query: "Bags", matches: [], images: Array(10).fill("data:image/jpeg;base64,x") }];
    expect(sourcingSubmission(turns, "+91 98765 43210")?.images).toHaveLength(8);
  });
});

describe("sourcing response latency", () => {
  it("does not call AI again after five questions or an explicit skip", () => {
    expect(needsSourcingQuestions([])).toBe(true);
    expect(needsSourcingQuestions([{ query: "Boxes", matches: [], questions: ["quantity", "size", "format", "wall", "printing"].map(topic => ({ topic, question: "Your preference?" })) }])).toBe(false);
    expect(needsSourcingQuestions([{ query: "Boxes", matches: [], questionsSkipped: true }])).toBe(false);
    expect(needsSourcingQuestions([{ query: "Boxes", matches: [], questions: [{ topic: "size", question: "Dimensions?" }] }])).toBe(false);
  });
  it("never opens a second questionnaire after partial answers or an initially complete request", () => {
    expect(needsSourcingQuestions([{ query: "Boxes", matches: [], questions: [{ topic: "size", question: "Dimensions?" }] }, { query: "Not sure, coffee brand", matches: [] }])).toBe(false);
    expect(needsSourcingQuestions([{ query: "500 printed boxes, 14 × 8 × 4 cm", matches: [], questions: [] }])).toBe(false);
  });
  it("renders incremental questions and requires a completed reply", async () => {
    const question = { topic: "size", question: "What dimensions?" };
    const updates: unknown[] = [];
    const response = new Response(`${JSON.stringify({ questions: [question] })}\n${JSON.stringify({ questions: [question], done: true })}\n`);
    expect(await readSourcingStream(response, value => updates.push(value))).toEqual([question]);
    expect(updates).toEqual([[question]]);
    await expect(readSourcingStream(new Response('{"questions":[]}\n'), () => {})).rejects.toThrow("interrupted");
    await expect(readSourcingStream(new Response('{"error":"AI is busy"}\n'), () => {})).rejects.toThrow("AI is busy");
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
  it("keeps the five-question limit for corrugated topics", () => {
    expect(validatedQuestions(["wall", "samples", "usage", "customisation", "finishing", "manufacturer_location"].map(topic => ({ topic, question: "Your preference?" })), [])).toHaveLength(5);
  });
});

describe("flexible-packaging requirement configuration", () => {
  it.each([
    ["product", ["Dry", "Powder", "Liquid", "Paste", "Oily products"]],
    ["size", ["Dimensions with units", "Fill weight in g or volume in ml", "Sachet fill bands: under 5 g/ml; 5–10 g/ml; 10–20 g/ml; above 20 g/ml"]],
    ["quantity", ["Buyer’s initial quantity", "Manufacturer-specific MOQ, to be confirmed"]],
    ["material", ["Mono-material", "Multilayer laminate", "Paper-based laminate", "Other available structures"]],
    ["barrier", ["Moisture barrier", "Oxygen barrier", "Light barrier", "High barrier"]],
    ["closure", ["Heat seal", "Zipper", "Spout", "Tear notch", "Other available closures"]],
    ["printing", ["Gravure", "Flexographic", "Digital"]],
    ["finishing", ["Gloss", "Matte", "Transparent", "Metallic effects"]],
    ["transparency", ["Transparent", "Opaque", "Window"]],
    ["filling", ["Manual filling", "Preformed-pouch machine", "Form-fill-seal machine"]],
    ["customisation", ["Custom size", "Printing", "Shape", "Material structure"]],
    ["certifications", ["Applicable food-contact certification", "Other relevant certifications"]],
    ["manufacturer_location", ["City and state"]],
    ["budget", ["Target price per piece", "Quote-based pricing"]],
    ["shelf_life", ["Target shelf life", "Intended storage conditions"]],
  ])("supports the supplied %s preferences", (topic, options) => {
    expect(FLEXIBLE_REQUIREMENTS.find(field => field.topic === topic)?.options).toEqual(options);
  });
  it("keeps sachets, stick packs, pouch constructions and film rolls distinct from zipper features", () => {
    const formats = FLEXIBLE_REQUIREMENTS.find(field => field.topic === "format")?.options;
    expect(formats).toEqual(["Stand-up pouch", "Flat / three-side-seal pouch", "Centre-seal / pillow pouch", "Side-gusset pouch", "Flat-bottom pouch", "Quad-seal pouch", "Spout pouch", "Shaped pouch", "Vacuum pouch", "Flat sachet", "Three-side-seal sachet", "Four-side-seal sachet", "Pillow sachet", "Stick pack", "Multi-compartment sachet, where supported", "Roll stock / packaging film", "Specialty / retort pouch, where supported"]);
  });
  it.each(["product", "barrier", "closure", "transparency", "filling", "certifications", "shelf_life"])("accepts %s questions without repeating answered topics", topic => {
    const question = { topic, question: "What do you need?" };
    expect(validatedQuestions([question], [])).toEqual([question]);
    expect(validatedQuestions([question], [{ query: "Sachets", matches: [], questions: [question] }])).toEqual([]);
  });
});
