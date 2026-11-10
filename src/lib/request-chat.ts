import { briefFields, parseBrief, questions, type BriefField, type RequestBrief } from "./parseBrief";

export type RequestFile = { name: string; size: number; type: string; url?: string };
type BaseMessage = { id: string; role: "user" | "assistant"; createdAt: number; state: "sending" | "sent" | "failed" };
export type RequestMessage = BaseMessage & (
  | { kind: "text"; text: string }
  | { kind: "chips"; text: string; field: BriefField; callback?: boolean }
  | { kind: "file"; file: RequestFile; progress: number }
  | { kind: "summary"; brief: RequestBrief }
  | { kind: "status"; text: string; complete: boolean }
  | { kind: "error"; text: string }
  | { kind: "typing" }
);
export type AssistantReply = { brief: RequestBrief; field?: BriefField; text: string; unclear: number; callback?: boolean; complete: boolean };
export type RequestInput = { text: string; brief: RequestBrief; field?: BriefField; unclear: number; file?: RequestFile };
export async function sendMessage(_history: RequestMessage[], input: RequestInput): Promise<AssistantReply> {
  await new Promise(resolve => setTimeout(resolve, 800));
  const parsed = parseBrief(input.text, input.field);
  const brief = { ...input.brief, ...parsed };
  const field = briefFields.find(key => !brief[key]);
  const understood = Object.keys(parsed).length > 0;
  const unclear = understood || input.file ? 0 : input.unclear + 1;
  const reflection = [parsed.quantity, parsed.product?.toLowerCase(), parsed.material ? `in ${parsed.material.toLowerCase()}` : "", parsed.city ? `delivered to ${parsed.city}` : ""].filter(Boolean).join(", ");
  const text = input.file ? "Thanks. I'll share your design with the makers." : understood ? `Got it: ${reflection}.` : `I couldn't tell what "${input.text}" means.`;
  return { brief, field, text: `${text}${field ? ` ${questions[field]}` : " Your brief is ready."}`, unclear, callback: unclear >= 2, complete: !field };
}
export const REQUEST_KEY = "snaplogo.request.preview.v1";
export type RequestState = { messages: RequestMessage[]; brief: RequestBrief; draft: string; field?: BriefField; unclear: number; step: number };
export function messageBase(role: BaseMessage["role"]): BaseMessage { return { id: crypto.randomUUID(), role, createdAt: Date.now(), state: "sent" }; }
export function freshRequest(): RequestState { return { messages: [{ ...messageBase("assistant"), kind: "chips", field: "product", text: "Tell me what you’re packaging. I’ll match you with manufacturers who quote within 6 hours." }], brief: {}, draft: "", field: "product", unclear: 0, step: 0 }; }
export function restoreRequest(): RequestState {
  try {
    const value = JSON.parse(localStorage.getItem(REQUEST_KEY) ?? "null") as RequestState | null;
    if (value && Array.isArray(value.messages) && value.brief && typeof value.draft === "string") return { ...value, messages: value.messages.filter(m => m.kind !== "typing").map(m => m.state === "sending" ? { ...m, state: "failed" } : m) };
  } catch { /* Use an empty preview if browser storage is unavailable. */ }
  return freshRequest();
}
export type RequestAction = { type: "draft"; text: string } | { type: "message"; message: RequestMessage } | { type: "sent" | "failed"; id: string } | { type: "reply"; reply: AssistantReply } | { type: "edit"; field: BriefField } | { type: "step"; step: number } | { type: "reset" } | { type: "matched"; id: string };
export function requestReducer(state: RequestState, action: RequestAction): RequestState {
  switch (action.type) {
    case "draft": return { ...state, draft: action.text };
    case "reset": return freshRequest();
    case "message": return { ...state, messages: [...state.messages, action.message], draft: "" };
    case "sent": case "failed": return { ...state, messages: state.messages.map(m => m.id === action.id ? { ...m, state: action.type, ...(m.kind === "file" && action.type === "sent" ? { progress: 100 } : {}) } : m) };
    case "reply": return { ...state, ...action.reply, messages: [...state.messages, action.reply.complete ? { ...messageBase("assistant"), kind: "text", text: action.reply.text } : { ...messageBase("assistant"), kind: "chips", text: action.reply.text, field: action.reply.field ?? "product", callback: action.reply.callback }, ...(action.reply.complete ? [{ ...messageBase("assistant"), kind: "summary" as const, brief: action.reply.brief }] : [])] };
    case "edit": { const brief = { ...state.brief }; delete brief[action.field]; return { ...state, brief, field: action.field, step: 0, messages: [...state.messages, { ...messageBase("assistant"), kind: "chips", text: questions[action.field], field: action.field }] }; }
    case "step": return { ...state, step: action.step };
    case "matched": return { ...state, step: 2, messages: state.messages.map(m => m.id === action.id && m.kind === "status" ? { ...m, complete: true, text: "3 manufacturers matched. Quotes arrive within 6 hours." } : m) };
  }
}