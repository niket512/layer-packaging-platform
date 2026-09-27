import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

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

export async function callProcureAi<R>(body: Record<string, unknown>): Promise<R> {
  const { data, error } = await supabase.functions.invoke("procure-ai", { body });
  if (error) {
    let msg = "AI request failed, please try again";
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx) msg = (await ctx.json()).error ?? msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data as R;
}

export const nextPoNumber = () => `PO-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 9000 + 1000)}`;
