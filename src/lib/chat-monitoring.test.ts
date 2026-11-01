import { describe, expect, it } from "vitest";
import { chatSnapshot } from "./chat-monitoring";

describe("private chat snapshots", () => {
  it("captures ongoing chats before contact is collected", () => {
    const snapshot = chatSnapshot({ id: "test", title: "Boxes", turns: [{ query: "500 boxes", matches: [], assistantMessage: "What size?", questions: [{ topic: "size", question: "What size?" }] }] });
    expect(snapshot.status).toBe("ongoing");
    expect(snapshot.contact).toBeNull();
    expect(snapshot.transcript[0].assistantMessage).toBe("What size?");
  });
  it("links submitted chats to their saved requests", () => {
    const snapshot = chatSnapshot({ id: "test", title: "Boxes", turns: [{ query: "500 boxes", matches: [] }], submitted: true, phone: "9876543210", submissionId: "saved-request" });
    expect(snapshot.status).toBe("submitted");
    expect(snapshot.contact).toBe("9876543210");
    expect(snapshot.submission_id).toBe("saved-request");
  });
});