import { useEffect, useState, useCallback } from "react";
import { Plus, Wand2, Sparkles as _unused, Trash2, Send, Trophy } from "lucide-react";
import ReactMarkdownless from "./PlainMarkdown";
import { supabase } from "@/integrations/supabase/client";
import {
  callProcureAi, fmtDate, inr, nextPoNumber, poLabel, poStep, PO_STATUSES,
  type PoUpdate, type PurchaseOrder, type Quote, type Rfq, type Supplier,
} from "@/lib/procure";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

void _unused;

export const Empty = ({ title, sub, action }: { title: string; sub: string; action?: React.ReactNode }) => (
  <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
    <p className="font-semibold text-foreground">{title}</p>
    <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const StatusPill = ({ s }: { s: string }) => (
  <span className={cn(
    "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
    s === "delivered" || s === "closed" || s === "awarded" ? "bg-emerald-500/10 text-emerald-700"
      : s === "draft" || s === "submitted" ? "bg-muted text-muted-foreground" : "bg-secondary text-secondary-foreground",
  )}>{s === "open" ? "Open" : s === "awarded" ? "Awarded" : s === "submitted" ? "Submitted" : s === "rejected" ? "Not selected" : poLabel(s)}</span>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>
);

/* ---------------- Overview ---------------- */
export function Overview({ go }: { go: (v: string) => void }) {
  const [c, setC] = useState({ rfqs: 0, quotes: 0, pos: 0, suppliers: 0 });
  useEffect(() => {
    (async () => {
      const [r, q, p, s] = await Promise.all([
        supabase.from("rfqs").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "submitted"),
        supabase.from("purchase_orders").select("id", { count: "exact", head: true }).not("status", "in", "(delivered,closed)"),
        supabase.from("suppliers").select("id", { count: "exact", head: true }),
      ]);
      setC({ rfqs: r.count ?? 0, quotes: q.count ?? 0, pos: p.count ?? 0, suppliers: s.count ?? 0 });
    })();
  }, []);
  const tiles = [
    { k: "rfqs", label: "Open RFQs", v: c.rfqs },
    { k: "rfqs", label: "Quotes to review", v: c.quotes },
    { k: "pos", label: "Active orders", v: c.pos },
    { k: "suppliers", label: "Suppliers", v: c.suppliers },
  ];
  const steps = ["Add your suppliers", "Create an RFQ and invite them", "Compare quotes and award", "Send the PO and track delivery"];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((t) => (
          <button key={t.label} onClick={() => go(t.k)} className="rounded-2xl border border-border bg-card p-4 text-left hover:border-primary/40">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t.label}</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{t.v}</p>
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="font-semibold text-foreground">How it works</p>
        <ol className="mt-3 grid gap-2 md:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s} className="rounded-xl bg-muted p-3 text-sm text-foreground">
              <span className="mr-2 font-bold text-primary">{i + 1}</span>{s}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ---------------- Suppliers ---------------- */
export function SuppliersView() {
  const [list, setList] = useState<Supplier[]>([]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", category: "", location: "", contact_name: "", email: "", phone: "", notes: "" });
  const load = useCallback(async () => {
    const { data } = await supabase.from("suppliers").select("*").order("created_at", { ascending: false });
    setList(data ?? []);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    if (!f.name.trim()) return toast.error("Supplier name is required");
    const { error } = await supabase.from("suppliers").insert({ ...f, email: f.email.trim().toLowerCase() || null });
    if (error) return toast.error(error.message);
    setOpen(false);
    setF({ name: "", category: "", location: "", contact_name: "", email: "", phone: "", notes: "" });
    void load();
  };
  const rate = async (s: Supplier, rating: number) => {
    await supabase.from("suppliers").update({ rating }).eq("id", s.id);
    void load();
  };
  const remove = async (s: Supplier) => {
    if (!confirm(`Remove ${s.name}?`)) return;
    await supabase.from("suppliers").delete().eq("id", s.id);
    void load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Suppliers sign in with the email you add here to see your RFQs</p>
        <Button className="rounded-full" onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" />Add supplier</Button>
      </div>
      {list.length === 0 ? (
        <Empty title="No suppliers yet" sub="Add the manufacturers you work with or want quotes from" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((s) => (
            <div key={s.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{[s.category, s.location].filter(Boolean).join(" · ") || "—"}</p>
                </div>
                <button onClick={() => remove(s)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
              <p className="mt-2 text-sm text-foreground">{s.contact_name} {s.email && <span className="text-muted-foreground">· {s.email}</span>}</p>
              {s.phone && <p className="text-xs text-muted-foreground">{s.phone}</p>}
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => rate(s, n)} className={cn("text-lg leading-none", (s.rating ?? 0) >= n ? "text-primary" : "text-border")}>★</button>
                ))}
              </div>
              {s.notes && <p className="mt-2 text-xs text-muted-foreground">{s.notes}</p>}
            </div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add supplier</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company name *"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
            <Field label="Category"><Input value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} placeholder="Pouches, bottles…" /></Field>
            <Field label="Location"><Input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></Field>
            <Field label="Contact person"><Input value={f.contact_name} onChange={(e) => setF({ ...f, contact_name: e.target.value })} /></Field>
            <Field label="Email (for supplier sign-in)"><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
            <Field label="Phone"><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
          </div>
          <Field label="Notes"><Textarea rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
          <Button className="rounded-full" onClick={save}>Save supplier</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- RFQs ---------------- */
const emptyRfq = { title: "", category: "", description: "", specs: "", quantity: "", unit: "units", target_price: "", due_date: "" };

export function RfqsView({ onPoCreated }: { onPoCreated: () => void }) {
  const [list, setList] = useState<(Rfq & { quotes: { count: number }[] })[]>([]);
  const [open, setOpen] = useState(false);
  const [ask, setAsk] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [f, setF] = useState(emptyRfq);
  const [active, setActive] = useState<Rfq | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("rfqs").select("*, quotes(count)").order("created_at", { ascending: false });
    setList((data as never) ?? []);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const draft = async () => {
    if (!ask.trim()) return;
    setDrafting(true);
    try {
      const { draft: d } = await callProcureAi<{ draft: Record<string, unknown> }>({ mode: "draft_rfq", ask });
      setF({
        ...f,
        title: String(d.title ?? ""), category: String(d.category ?? ""), description: String(d.description ?? ""),
        specs: String(d.specs ?? ""), quantity: d.quantity ? String(d.quantity) : "", unit: String(d.unit ?? "units"),
        target_price: d.target_price ? String(d.target_price) : "",
      });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDrafting(false);
    }
  };

  const create = async () => {
    if (!f.title.trim()) return toast.error("Give the RFQ a title");
    const { data, error } = await supabase.from("rfqs").insert({
      title: f.title, category: f.category || null, description: f.description || null, specs: f.specs || null,
      quantity: f.quantity ? Number(f.quantity) : null, unit: f.unit || "units",
      target_price: f.target_price ? Number(f.target_price) : null, due_date: f.due_date || null,
    }).select().single();
    if (error) return toast.error(error.message);
    setOpen(false); setF(emptyRfq); setAsk("");
    await load();
    setActive(data);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="rounded-full" onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" />New RFQ</Button>
      </div>
      {list.length === 0 ? (
        <Empty title="No RFQs yet" sub="Describe what you need and invite suppliers to quote" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {list.map((r) => (
            <button key={r.id} onClick={() => setActive(r)} className="flex w-full items-center justify-between gap-3 border-b border-border px-4 py-3 text-left last:border-0 hover:bg-muted">
              <div>
                <p className="font-medium text-foreground">{r.title}</p>
                <p className="text-xs text-muted-foreground">
                  {r.quantity ? `${Number(r.quantity).toLocaleString("en-IN")} ${r.unit}` : "Qty —"} · Due {fmtDate(r.due_date)} · {r.quotes?.[0]?.count ?? 0} quotes
                </p>
              </div>
              <StatusPill s={r.status} />
            </button>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>New request for quote</DialogTitle></DialogHeader>
          <div className="rounded-xl bg-secondary p-3">
            <Label className="text-xs">Describe it in one line and let AI draft the RFQ</Label>
            <div className="mt-2 flex gap-2">
              <Input value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="e.g. 10,000 matte stand-up pouches for 250 g coffee with zip" />
              <Button variant="outline" className="shrink-0 rounded-full" disabled={drafting} onClick={draft}>
                <Wand2 className="mr-1 h-4 w-4" />{drafting ? "Drafting…" : "Draft with AI"}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Field label="Title *"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field></div>
            <Field label="Category"><Input value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} /></Field>
            <Field label="Quote due by"><Input type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} /></Field>
            <Field label="Quantity"><Input type="number" value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} /></Field>
            <Field label="Unit"><Input value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })} /></Field>
            <Field label="Target price per unit (₹)"><Input type="number" value={f.target_price} onChange={(e) => setF({ ...f, target_price: e.target.value })} /></Field>
          </div>
          <Field label="Description"><Textarea rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <Field label="Specifications"><Textarea rows={6} value={f.specs} onChange={(e) => setF({ ...f, specs: e.target.value })} /></Field>
          <Button className="rounded-full" onClick={create}>Create RFQ</Button>
        </DialogContent>
      </Dialog>

      <RfqDetail rfq={active} onClose={() => { setActive(null); void load(); }} onPoCreated={onPoCreated} />
    </div>
  );
}

function RfqDetail({ rfq, onClose, onPoCreated }: { rfq: Rfq | null; onClose: () => void; onPoCreated: () => void }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [invited, setInvited] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<(Quote & { suppliers: { name: string } | null })[]>([]);
  const [analysis, setAnalysis] = useState("");
  const [analysing, setAnalysing] = useState(false);
  const [manual, setManual] = useState({ supplier_id: "", unit_price: "", moq: "", lead_time_days: "", terms: "" });

  const load = useCallback(async () => {
    if (!rfq) return;
    const [s, i, q] = await Promise.all([
      supabase.from("suppliers").select("*").order("name"),
      supabase.from("rfq_invites").select("supplier_id").eq("rfq_id", rfq.id),
      supabase.from("quotes").select("*, suppliers(name)").eq("rfq_id", rfq.id).order("unit_price"),
    ]);
    setSuppliers(s.data ?? []);
    setInvited((i.data ?? []).map((x) => x.supplier_id));
    setQuotes((q.data as never) ?? []);
  }, [rfq]);
  useEffect(() => { setAnalysis(""); void load(); }, [load]);

  if (!rfq) return null;

  const toggleInvite = async (id: string) => {
    if (invited.includes(id)) await supabase.from("rfq_invites").delete().eq("rfq_id", rfq.id).eq("supplier_id", id);
    else await supabase.from("rfq_invites").insert({ rfq_id: rfq.id, supplier_id: id });
    void load();
  };

  const addManual = async () => {
    if (!manual.supplier_id || !manual.unit_price) return toast.error("Pick a supplier and enter a price");
    const { error } = await supabase.from("quotes").upsert({
      rfq_id: rfq.id, supplier_id: manual.supplier_id, unit_price: Number(manual.unit_price),
      moq: manual.moq ? Number(manual.moq) : null, lead_time_days: manual.lead_time_days ? Number(manual.lead_time_days) : null,
      terms: manual.terms || null,
    }, { onConflict: "rfq_id,supplier_id" });
    if (error) return toast.error(error.message);
    setManual({ supplier_id: "", unit_price: "", moq: "", lead_time_days: "", terms: "" });
    void load();
  };

  const compare = async () => {
    setAnalysing(true);
    try {
      const { analysis: a } = await callProcureAi<{ analysis: string }>({
        mode: "compare",
        rfq: { title: rfq.title, specs: rfq.specs, quantity: rfq.quantity, unit: rfq.unit, target_price: rfq.target_price, due_date: rfq.due_date },
        quotes: quotes.map((q) => ({ supplier: q.suppliers?.name, unit_price: q.unit_price, moq: q.moq, lead_time_days: q.lead_time_days, terms: q.terms, notes: q.notes })),
      });
      setAnalysis(a);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setAnalysing(false);
    }
  };

  const award = async (q: Quote) => {
    await supabase.from("quotes").update({ status: "awarded" }).eq("id", q.id);
    await supabase.from("quotes").update({ status: "rejected" }).eq("rfq_id", rfq.id).neq("id", q.id);
    await supabase.from("rfqs").update({ status: "awarded" }).eq("id", rfq.id);
    const qty = rfq.quantity ? Number(rfq.quantity) : null;
    const { error } = await supabase.from("purchase_orders").insert({
      rfq_id: rfq.id, quote_id: q.id, supplier_id: q.supplier_id, po_number: nextPoNumber(), title: rfq.title,
      quantity: qty, unit_price: q.unit_price, total: qty ? qty * Number(q.unit_price) : null,
    });
    if (error) return toast.error(error.message);
    toast.success("Quote awarded — a draft purchase order is ready");
    onClose();
    onPoCreated();
  };

  const best = quotes.length ? Math.min(...quotes.map((q) => Number(q.unit_price))) : null;

  return (
    <Sheet open={!!rfq} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader><SheetTitle>{rfq.title}</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-5 text-sm">
          <div className="grid grid-cols-3 gap-3 rounded-xl bg-muted p-3">
            <div><p className="text-xs text-muted-foreground">Quantity</p><p className="font-medium">{rfq.quantity ? `${Number(rfq.quantity).toLocaleString("en-IN")} ${rfq.unit}` : "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Target</p><p className="font-medium">{inr(rfq.target_price)}</p></div>
            <div><p className="text-xs text-muted-foreground">Due</p><p className="font-medium">{fmtDate(rfq.due_date)}</p></div>
          </div>
          {rfq.description && <p className="text-foreground">{rfq.description}</p>}
          {rfq.specs && <pre className="whitespace-pre-wrap rounded-xl border border-border p-3 font-sans text-[13px] text-foreground">{rfq.specs}</pre>}

          <div>
            <p className="mb-2 font-semibold">Invite suppliers</p>
            {suppliers.length === 0 ? <p className="text-muted-foreground">Add suppliers first in the Suppliers tab</p> : (
              <div className="flex flex-wrap gap-2">
                {suppliers.map((s) => (
                  <button key={s.id} disabled={rfq.status !== "open"} onClick={() => toggleInvite(s.id)}
                    className={cn("rounded-full border px-3 py-1 text-xs", invited.includes(s.id) ? "border-primary bg-secondary text-secondary-foreground" : "border-border")}>
                    {invited.includes(s.id) ? "✓ " : ""}{s.name}{!s.email && " (no email)"}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold">Quotes ({quotes.length})</p>
              {quotes.length > 0 && (
                <Button size="sm" variant="outline" className="rounded-full" disabled={analysing} onClick={compare}>
                  <Wand2 className="mr-1 h-3.5 w-3.5" />{analysing ? "Comparing…" : "Compare with AI"}
                </Button>
              )}
            </div>
            {quotes.length === 0 ? <p className="text-muted-foreground">No quotes yet — invited suppliers can submit after signing in, or log one below</p> : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-muted text-xs text-muted-foreground">
                    <tr><th className="p-2">Supplier</th><th className="p-2">Unit price</th><th className="p-2">MOQ</th><th className="p-2">Lead time</th><th className="p-2">Terms</th><th className="p-2" /></tr>
                  </thead>
                  <tbody>
                    {quotes.map((q) => (
                      <tr key={q.id} className="border-t border-border">
                        <td className="p-2 font-medium">{q.suppliers?.name}</td>
                        <td className={cn("p-2", Number(q.unit_price) === best && "font-semibold text-primary")}>{inr(q.unit_price)}</td>
                        <td className="p-2">{q.moq ? Number(q.moq).toLocaleString("en-IN") : "—"}</td>
                        <td className="p-2">{q.lead_time_days ? `${q.lead_time_days} days` : "—"}</td>
                        <td className="p-2 text-muted-foreground">{q.terms ?? "—"}</td>
                        <td className="p-2 text-right">
                          {rfq.status === "open" ? (
                            <Button size="sm" className="h-7 rounded-full" onClick={() => award(q)}><Trophy className="mr-1 h-3 w-3" />Award</Button>
                          ) : <StatusPill s={q.status} />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {analysis && <div className="mt-3 rounded-xl border border-primary/30 bg-secondary/50 p-3"><ReactMarkdownless text={analysis} /></div>}
          </div>

          {rfq.status === "open" && invited.length > 0 && (
            <div className="rounded-xl border border-border p-3">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Log a quote received by phone or email</p>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                <select className="h-9 rounded-md border border-input bg-background px-2 text-sm md:col-span-2" value={manual.supplier_id} onChange={(e) => setManual({ ...manual, supplier_id: e.target.value })}>
                  <option value="">Supplier</option>
                  {suppliers.filter((s) => invited.includes(s.id)).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <Input className="h-9" type="number" placeholder="₹ / unit" value={manual.unit_price} onChange={(e) => setManual({ ...manual, unit_price: e.target.value })} />
                <Input className="h-9" type="number" placeholder="MOQ" value={manual.moq} onChange={(e) => setManual({ ...manual, moq: e.target.value })} />
                <Input className="h-9" type="number" placeholder="Days" value={manual.lead_time_days} onChange={(e) => setManual({ ...manual, lead_time_days: e.target.value })} />
              </div>
              <div className="mt-2 flex gap-2">
                <Input className="h-9" placeholder="Terms (e.g. 50% advance)" value={manual.terms} onChange={(e) => setManual({ ...manual, terms: e.target.value })} />
                <Button size="sm" className="rounded-full" onClick={addManual}>Add</Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ---------------- Purchase orders ---------------- */
export function OrdersView({ supplierMode = false }: { supplierMode?: boolean }) {
  const [list, setList] = useState<(PurchaseOrder & { suppliers: { name: string } | null })[]>([]);
  const [active, setActive] = useState<PurchaseOrder | null>(null);
  const load = useCallback(async () => {
    const { data } = await supabase.from("purchase_orders").select("*, suppliers(name)").order("created_at", { ascending: false });
    setList((data as never) ?? []);
  }, []);
  useEffect(() => { void load(); }, [load]);

  return (
    <div className="space-y-4">
      {list.length === 0 ? (
        <Empty title="No purchase orders yet" sub={supplierMode ? "Orders sent to you will appear here" : "Award a quote on an RFQ to create your first PO"} />
      ) : (
        <div className="grid gap-3">
          {list.map((p) => (
            <button key={p.id} onClick={() => setActive(p)} className="rounded-2xl border border-border bg-card p-4 text-left hover:border-primary/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.po_number} · {p.suppliers?.name} · {inr(p.total)}</p>
                </div>
                <StatusPill s={p.status} />
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, (poStep(p.status) / (PO_STATUSES.length - 1)) * 100)}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Expected ship {fmtDate(p.expected_ship_date)}</p>
            </button>
          ))}
        </div>
      )}
      <PoDetail po={active} supplierMode={supplierMode} onClose={() => { setActive(null); void load(); }} />
    </div>
  );
}

function PoDetail({ po, supplierMode, onClose }: { po: PurchaseOrder | null; supplierMode: boolean; onClose: () => void }) {
  const [p, setP] = useState<PurchaseOrder | null>(po);
  const [updates, setUpdates] = useState<PoUpdate[]>([]);
  const [note, setNote] = useState("");
  const [ship, setShip] = useState("");

  const load = useCallback(async () => {
    if (!po) return;
    const [a, b] = await Promise.all([
      supabase.from("purchase_orders").select("*").eq("id", po.id).single(),
      supabase.from("po_updates").select("*").eq("po_id", po.id).order("created_at", { ascending: false }),
    ]);
    setP(a.data); setUpdates(b.data ?? []);
    setShip(a.data?.expected_ship_date ?? "");
  }, [po]);
  useEffect(() => { void load(); }, [load]);
  if (!po || !p) return null;

  const founderSet = async (status: string) => {
    const { error } = await supabase.from("purchase_orders").update({ status, expected_ship_date: ship || null }).eq("id", p.id);
    if (error) return toast.error(error.message);
    await supabase.from("po_updates").insert({ po_id: p.id, status, note: note || null });
    setNote(""); void load();
  };
  const supplierSet = async (status: string) => {
    const { error } = await supabase.rpc("supplier_update_po", { _po_id: p.id, _status: status, _note: note, _ship: ship || null });
    if (error) return toast.error(error.message);
    setNote(""); void load();
  };
  const addNote = async () => {
    if (!note.trim()) return;
    await supabase.from("po_updates").insert({ po_id: p.id, note });
    setNote(""); void load();
  };

  const step = poStep(p.status);
  const supplierNext = ["accepted", "in_production", "shipped", "delivered"].filter((s) => poStep(s) > step);

  return (
    <Sheet open={!!po} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader><SheetTitle>{p.po_number}</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-5 text-sm">
          <p className="font-semibold text-foreground">{p.title}</p>
          <div className="grid grid-cols-3 gap-3 rounded-xl bg-muted p-3">
            <div><p className="text-xs text-muted-foreground">Quantity</p><p className="font-medium">{p.quantity ? Number(p.quantity).toLocaleString("en-IN") : "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Unit price</p><p className="font-medium">{inr(p.unit_price)}</p></div>
            <div><p className="text-xs text-muted-foreground">Total</p><p className="font-medium">{inr(p.total)}</p></div>
          </div>

          <ol className="flex flex-wrap gap-1.5">
            {PO_STATUSES.map((s, i) => (
              <li key={s.id} className={cn("rounded-full px-2.5 py-1 text-[11px]", i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{s.label}</li>
            ))}
          </ol>

          <div className="space-y-2 rounded-xl border border-border p-3">
            <Field label="Expected ship date"><Input type="date" value={ship} onChange={(e) => setShip(e.target.value)} /></Field>
            <Textarea rows={2} placeholder="Add a note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              {!supplierMode && p.status === "draft" && <Button size="sm" className="rounded-full" onClick={() => founderSet("sent")}><Send className="mr-1 h-3.5 w-3.5" />Approve & send to supplier</Button>}
              {!supplierMode && p.status === "delivered" && <Button size="sm" className="rounded-full" onClick={() => founderSet("closed")}>Close order</Button>}
              {!supplierMode && p.status !== "draft" && p.status !== "closed" && p.status !== "delivered" && (
                <select className="h-8 rounded-full border border-input bg-background px-3 text-xs" value="" onChange={(e) => e.target.value && founderSet(e.target.value)}>
                  <option value="">Update status…</option>
                  {PO_STATUSES.filter((_, i) => i > step).map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              )}
              {supplierMode && supplierNext.map((s) => (
                <Button key={s} size="sm" variant={s === supplierNext[0] ? "default" : "outline"} className="rounded-full" onClick={() => supplierSet(s)}>Mark {poLabel(s).toLowerCase()}</Button>
              ))}
              <Button size="sm" variant="ghost" className="rounded-full" onClick={addNote}>Post note</Button>
            </div>
          </div>

          <div>
            <p className="mb-2 font-semibold">Timeline</p>
            {updates.length === 0 ? <p className="text-muted-foreground">No updates yet</p> : (
              <ul className="space-y-2">
                {updates.map((u) => (
                  <li key={u.id} className="rounded-xl bg-muted p-3">
                    <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleString("en-IN")}{u.status && ` · ${poLabel(u.status)}`}</p>
                    {u.note && <p className="mt-1 text-foreground">{u.note}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
