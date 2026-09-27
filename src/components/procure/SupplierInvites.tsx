import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fmtDate, inr, type Quote, type Rfq } from "@/lib/procure";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Empty, StatusPill } from "./FounderViews";
import { toast } from "sonner";

type Invite = { supplier_id: string; rfqs: Rfq | null };

export default function SupplierInvites() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [forms, setForms] = useState<Record<string, { unit_price: string; moq: string; lead_time_days: string; terms: string; notes: string }>>({});

  const load = useCallback(async () => {
    const [i, q] = await Promise.all([
      supabase.from("rfq_invites").select("supplier_id, rfqs(*)").order("created_at", { ascending: false }),
      supabase.from("quotes").select("*"),
    ]);
    setInvites((i.data as never) ?? []);
    setQuotes(q.data ?? []);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const submit = async (inv: Invite) => {
    const r = inv.rfqs!;
    const f = forms[r.id];
    if (!f?.unit_price) return toast.error("Enter your price per unit");
    const existing = quotes.find((q) => q.rfq_id === r.id);
    const payload = {
      unit_price: Number(f.unit_price), moq: f.moq ? Number(f.moq) : null,
      lead_time_days: f.lead_time_days ? Number(f.lead_time_days) : null, terms: f.terms || null, notes: f.notes || null,
    };
    const { error } = existing
      ? await supabase.from("quotes").update(payload).eq("id", existing.id)
      : await supabase.from("quotes").insert({ ...payload, rfq_id: r.id, supplier_id: inv.supplier_id });
    if (error) return toast.error(error.message);
    toast.success(existing ? "Quote revised" : "Quote submitted");
    void load();
  };

  if (invites.length === 0)
    return <Empty title="No RFQ invites yet" sub="When a founder adds your sign-in email as a supplier and invites you, the request appears here" />;

  return (
    <div className="grid gap-4">
      {invites.filter((i) => i.rfqs).map((inv) => {
        const r = inv.rfqs!;
        const q = quotes.find((x) => x.rfq_id === r.id);
        const f = forms[r.id] ?? {
          unit_price: q ? String(q.unit_price) : "", moq: q?.moq ? String(q.moq) : "",
          lead_time_days: q?.lead_time_days ? String(q.lead_time_days) : "", terms: q?.terms ?? "", notes: q?.notes ?? "",
        };
        const setF = (patch: Partial<typeof f>) => setForms({ ...forms, [r.id]: { ...f, ...patch } });
        const editable = r.status === "open" && (!q || q.status === "submitted");
        return (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">{r.title}</p>
                <p className="text-xs text-muted-foreground">
                  {r.quantity ? `${Number(r.quantity).toLocaleString("en-IN")} ${r.unit}` : "Qty —"} · Target {inr(r.target_price)} · Due {fmtDate(r.due_date)}
                </p>
              </div>
              <StatusPill s={q ? q.status : r.status} />
            </div>
            {r.description && <p className="mt-2 text-sm text-foreground">{r.description}</p>}
            {r.specs && <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-muted p-3 font-sans text-[13px] text-foreground">{r.specs}</pre>}
            {editable ? (
              <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                <Input type="number" placeholder="₹ per unit *" value={f.unit_price} onChange={(e) => setF({ unit_price: e.target.value })} />
                <Input type="number" placeholder="MOQ" value={f.moq} onChange={(e) => setF({ moq: e.target.value })} />
                <Input type="number" placeholder="Lead time (days)" value={f.lead_time_days} onChange={(e) => setF({ lead_time_days: e.target.value })} />
                <Input placeholder="Payment terms" value={f.terms} onChange={(e) => setF({ terms: e.target.value })} />
                <Input className="col-span-2 md:col-span-3" placeholder="Notes for the founder" value={f.notes} onChange={(e) => setF({ notes: e.target.value })} />
                <Button className="rounded-full" onClick={() => submit(inv)}>{q ? "Revise quote" : "Submit quote"}</Button>
              </div>
            ) : q ? (
              <p className="mt-3 text-sm text-muted-foreground">Your quote: {inr(q.unit_price)} / unit · MOQ {q.moq ?? "—"} · {q.lead_time_days ?? "—"} days</p>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">This RFQ is closed</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
