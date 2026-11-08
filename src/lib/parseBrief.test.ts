import { describe, expect, it } from "vitest";
import { parseBrief, validateRequestFile } from "./parseBrief";
import { freshRequest, requestReducer, sendMessage } from "./request-chat";

describe("request preview rules", () => {
  it("extracts the three supplied fields from one request", () => {
    expect(parseBrief("5k mono cartons for skincare in pune")).toEqual({ product: "Mono cartons", quantity: "5,000", city: "Pune" });
  });
  it.each(["5k", "5,000", "5000 pcs"])("understands quantity %s", text => expect(parseBrief(text).quantity).toBe("5,000"));
  it("understands one lakh", () => expect(parseBrief("1 lakh").quantity).toBe("1,00,000"));
  it.each(["Delhi", "Noida", "Gurugram", "Ghaziabad"])("normalizes %s to Delhi NCR", text => expect(parseBrief(text).city).toBe("Delhi NCR"));
  it("accepts a free-text delivery city", () => expect(parseBrief("Miraj", "city").city).toBe("Miraj"));
  it("rejects an eleven MB file", () => expect(validateRequestFile({ name: "design.pdf", type: "application/pdf", size: 11 * 1024 * 1024 })).toBe("File is too large. The limit is 10 MB."));
  it("accepts a ten MB AI file", () => expect(validateRequestFile({ name: "design.ai", type: "application/postscript", size: 10 * 1024 * 1024 })).toBeUndefined());
  it("rejects unsupported files", () => expect(validateRequestFile({ name: "design.exe", type: "", size: 100 })).toBe("This format isn't supported. Use PNG, JPG, PDF or AI."));
  it("offers a callback after two unclear replies", async () => {
    const reply = await sendMessage([], { text: "ww", brief: {}, field: "product", unclear: 1 });
    expect(reply.callback).toBe(true); expect(reply.field).toBe("product"); expect(reply.brief).toEqual({});
  });
  it("asks only material when the other three fields were supplied", async () => {
    const reply = await sendMessage([], { text: "5k mono cartons for skincare in pune", brief: {}, field: "product", unclear: 0 });
    expect(reply.field).toBe("material"); expect(reply.complete).toBe(false);
  });
  it("editing a filled pill reopens that field", () => {
    const state = { ...freshRequest(), brief: { product: "Mono cartons", quantity: "5,000", material: "Kraft", city: "Pune" } };
    const edited = requestReducer(state, { type: "edit", field: "quantity" });
    expect(edited.field).toBe("quantity"); expect(edited.brief.quantity).toBeUndefined(); expect(edited.brief.city).toBe("Pune");
  });
});