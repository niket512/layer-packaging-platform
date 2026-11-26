import type { Database } from "@/integrations/supabase/types";
import { procureAi, type ProcureAiInput } from "@/lib/procure-ai.functions";

type T = Database["public"]["Tables"];
export type Supplier = T["suppliers"]["Row"];
export type Rfq = T["rfqs"]["Row"];
export type Quote = T["quotes"]["Row"];
export type PurchaseOrder = T["purchase_orders"]["Row"];
export type PoUpdate = T["po_updates"]["Row"];
export type Role = Database["public"]["Enums"]["app_role"];

export const PO_STATUSES = [
  { id: "draft", label: "Draft" },
  { id: "sent", label: "Sent" },
  { id: "accepted", label: "Accepted" },
  { id: "in_production", label: "In production" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "closed", label: "Closed" },
] as const;

export const poLabel = (s: string) => PO_STATUSES.find((x) => x.id === s)?.label ?? s;
export const poStep = (s: string) => PO_STATUSES.findIndex((x) => x.id === s);

export const inr = (n: number | null | undefined) =>
  n == null ? "—" : `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export async function callProcureAi<R>(body: ProcureAiInput): Promise<R> {
  try {
    return await procureAi({ data: body }) as R;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) throw new Error("Please sign in to use AI features");
    throw error;
  }
}

export const nextPoNumber = () => `PO-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 9000 + 1000)}`;
