import { useCallback, useEffect, useState } from "react";
import { FileUp, ImagePlus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import AppShell, { SignInBox, useSession } from "@/components/market/AppShell";
import type { Database } from "@/integrations/supabase/types";
import { cropProductImages, pdfPageText } from "@/lib/pdf-crops";
import { imageFileToDataUrl } from "@/lib/image-data-url";

type Store = Database["public"]["Tables"]["stores"]["Row"];
type Product = Database["public"]["Tables"]["market_products"]["Row"];
type Upload = Database["public"]["Tables"]["catalogue_uploads"]["Row"];

const badge: Record<string, string> = {
  draft: "bg-muted text-muted-foreground", pending: "bg-secondary text-secondary-foreground",
  approved: "bg-primary text-primary-foreground", rejected: "bg-destructive text-destructive-foreground",
  processing: "bg-secondary text-secondary-foreground", done: "bg-primary text-primary-foreground",
  failed: "bg-destructive text-destructive-foreground", uploaded: "bg-muted text-muted-foreground",
};
const Badge = ({ s }: { s: string }) => <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${badge[s] ?? ""}`}>{s}</span>;
const FIELDS = ["name", "category", "material", "capacity", "dimensions", "moq"] as const;

export default function AppStore() {
  const { user, roles, loading, reload } = useSession();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [form, setForm] = useState({ name: "", location: "", categories: "", description: "" });
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    const { data: s } = await supabase.from("stores").select("*").eq("owner_id", user.id).maybeSingle();
    setStore(s);
    if (s) {
      setForm({ name: s.name, location: s.location ?? "", categories: s.categories ?? "", description: s.description ?? "" });
      const [p, u] = await Promise.all([
        supabase.from("market_products").select("*").eq("store_id", s.id).order("created_at", { ascending: false }),
        supabase.from("catalogue_uploads").select("*").eq("store_id", s.id).order("created_at", { ascending: false }),
      ]);
      setProducts(p.data ?? []);
      setUploads(u.data ?? []);
    }
  }, [user]);
  useEffect(() => { void refresh(); }, [refresh]);

  if (loading) return <AppShell><p className="text-muted-foreground">Loading…</p></AppShell>;
  const isAdmin = roles.includes("admin");
  if (!user) return <AppShell><SignInBox title="Sign in to manage your store" /></AppShell>;
  const otherRole = roles.find((r) => r === "founder" || r === "supplier");
  if (otherRole && !roles.includes("manufacturer") && !isAdmin) {
    return <AppShell user={user}><p className="text-muted-foreground">This account is set up as a {otherRole}. Sign in with a different account to run a manufacturer store.</p></AppShell>;
  }

  const saveStore = async () => {
    if (!form.name.trim()) return toast.error("Store name is required");
    setBusy(true);
    if (!roles.length) {
      const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role: "manufacturer" });
      if (error) { setBusy(false); return toast.error(error.message); }
      await reload();
    }
    const payload = { name: form.name.trim(), location: form.location || null, categories: form.categories || null, description: form.description || null };
    const { error } = store
      ? await supabase.from("stores").update({ ...payload, status: "pending" }).eq("id", store.id)
      : await supabase.from("stores").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(store ? "Store updated and sent for review" : "Store created — it will go live after review");
    void refresh();
  };

  const uploadPdf = async (file: File) => {
    if (!store) return;
    if (file.type !== "application/pdf") return toast.error("Please choose a PDF");
    if (file.size > 20 * 1024 * 1024) return toast.error("PDF must be under 20 MB");
    setBusy(true);
    const path = `${user.id}/${crypto.randomUUID()}.pdf`;
    const { error: upErr } = await supabase.storage.from("catalogue-pdfs").upload(path, file, { contentType: "application/pdf" });
    if (upErr) { setBusy(false); return toast.error(upErr.message); }
    const { data: row, error } = await supabase.from("catalogue_uploads").insert({ store_id: store.id, file_path: path, file_name: file.name }).select().single();
    if (error || !row) { setBusy(false); return toast.error(error?.message ?? "Upload failed"); }
    void refresh();
    toast.info("Reading your catalogue with AI — this can take a minute");
    let text = "";
    try { text = await pdfPageText(file); } catch (e) { console.error("page text failed", e); }
    const useText = text.replace(/=== Page.*===/g, "").trim().length > 300;
    // Send the text in small groups of pages so each AI read stays quick.
    const chunks: { text?: string; images?: { page: number; url: string }[] }[] = [];
    if (useText) {
      let cur = "";
      for (const part of text.split(/(?=\n=== Page )/)) {
        if (cur && cur.length + part.length > 30_000) { chunks.push({ text: cur }); cur = ""; }
        cur += part;
      }
      if (cur.trim()) chunks.push({ text: cur });
    } else {
      // Scanned PDF: send page pictures, a few at a time
      try {
        const imgs = await pdfPageImages(file);
        for (let i = 0; i < imgs.length; i += 3) chunks.push({ images: imgs.slice(i, i + 3) });
      } catch (e) { console.error("page pictures failed", e); chunks.push({}); }
    }
    let total = 0;
    let fnErr: unknown = null;
    for (let i = 0; i < chunks.length; i++) {
      if (chunks.length > 1) toast.info(`Reading part ${i + 1} of ${chunks.length}…`);
      const res = await supabase.functions.invoke("extract-catalogue", { body: { uploadId: row.id, ...chunks[i] } });
      if (res.error) { fnErr = res.error; break; }
      total += res.data?.count ?? 0;
    }
    if (fnErr && !total) {
      let msg = "Could not read this catalogue";
      try { msg = (await (fnErr as { context?: Response }).context?.json())?.error ?? msg; } catch { /* ignore */ }
      toast.error(msg);
    } else {
      toast.success(`Found ${total} products — cutting out their photos…`);
      try {
        const { data: fresh } = await supabase.from("market_products").select("id,page,bbox").eq("upload_id", row.id);
        const reqs = (fresh ?? []).filter((p) => p.page).map((p) => ({ id: p.id, page: p.page as number, bbox: Array.isArray(p.bbox) ? (p.bbox as number[]) : null }));
        const crops = await cropProductImages(file, reqs);
        await Promise.all(Object.entries(crops).map(([id, url]) => supabase.from("market_products").update({ image_url: url }).eq("id", id)));
        toast.success(`Added ${Object.keys(crops).length} product photos — review them below, then submit`);
      } catch {
        toast.error("Products saved, but photos could not be cut from this PDF");
      }
    }
    setBusy(false);
    void refresh();
  };

  const updateProduct = async (p: Product, patch: Partial<Product>) => {
    const { error } = await supabase.from("market_products").update(patch).eq("id", p.id);
    if (error) toast.error(error.message); else void refresh();
  };
  const removeProduct = async (id: string) => {
    await supabase.from("market_products").delete().eq("id", id);
    void refresh();
  };
  const submitAll = async () => {
    const ids = products.filter((p) => p.status === "draft" || p.status === "rejected").map((p) => p.id);
    if (!ids.length) return;
    const { error } = await supabase.from("market_products").update({ status: "pending" }).in("id", ids);
    if (error) toast.error(error.message); else { toast.success(`${ids.length} products sent for review`); void refresh(); }
  };
  const addProduct = async () => {
    if (!store) return;
    const { data } = await supabase.from("market_products").insert({ store_id: store.id, name: "New product" }).select().single();
    if (data) setEditing(data.id);
    void refresh();
  };

  const drafts = products.filter((p) => p.status === "draft" || p.status === "rejected").length;

  return (
    <AppShell user={user} isAdmin={isAdmin}>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-3xl font-bold text-foreground">My store</h1>
        {store && <Badge s={store.status} />}
      </div>

      <section className="mt-5 grid gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm md:grid-cols-2">
        <div className="space-y-1"><Label>Store name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Aasic Plastics" /></div>
        <div className="space-y-1"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, State" /></div>
        <div className="space-y-1 md:col-span-2"><Label>What you make</Label><Input value={form.categories} onChange={(e) => setForm({ ...form, categories: e.target.value })} placeholder="HDPE bottles, jars, caps" /></div>
        <div className="space-y-1 md:col-span-2"><Label>About</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="md:col-span-2"><Button className="rounded-full" disabled={busy} onClick={saveStore}>{store ? "Save store" : "Create store"}</Button></div>
      </section>

      {store && (
        <>
          <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-foreground">Upload a catalogue PDF</h2>
                <p className="text-sm text-muted-foreground">AI pulls out your products so you only need to check them.</p>
              </div>
              <label className={`inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ${busy ? "pointer-events-none opacity-60" : ""}`}>
                <FileUp className="h-4 w-4" />{busy ? "Working…" : "Choose PDF"}
                <input type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void uploadPdf(f); }} />
              </label>
            </div>
            {uploads.length > 0 && (
              <ul className="mt-4 divide-y divide-border text-sm">
                {uploads.map((u) => (
                  <li key={u.id} className="flex items-center justify-between py-2">
                    <span className="truncate text-foreground">{u.file_name}</span>
                    <span className="flex items-center gap-2">{u.error && <span className="text-xs text-destructive">{u.error}</span>}<Badge s={u.status} /></span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-foreground">Products ({products.length})</h2>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full" onClick={addProduct}>Add product</Button>
                <Button className="rounded-full" disabled={!drafts} onClick={submitAll}>Submit {drafts || ""} for review</Button>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {products.length === 0 && <p className="rounded-2xl border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground">No products yet. Upload a PDF or add one by hand.</p>}
              {products.map((p) => editing === p.id ? (
                <ProductEditor key={p.id} p={p} onCancel={() => setEditing(null)} onSave={async (patch) => { await updateProduct(p, { ...patch, status: "draft" }); setEditing(null); }} />
              ) : (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                  <label title={p.status === "approved" ? undefined : "Add or change photo"} className={`relative h-12 w-12 shrink-0 ${p.status === "approved" ? "" : "cursor-pointer"}`}>
                    {p.image_url ? <img src={p.image_url} alt="" className="h-12 w-12 rounded-lg border border-border bg-background object-contain" /> : <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted"><ImagePlus className="h-4 w-4 text-muted-foreground" /></div>}
                    {p.status !== "approved" && <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const f = e.target.files?.[0]; e.target.value = ""; if (!f) return;
                      try { await updateProduct(p, { image_url: await imageFileToDataUrl(f), status: "draft" }); toast.success("Photo added"); } catch (err) { toast.error((err as Error).message); }
                    }} />}
                  </label>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{[p.category, p.material, p.capacity, p.dimensions, p.moq && `MOQ ${p.moq}`].filter(Boolean).join(" · ")}</p>
                  </div>
                  <Badge s={p.status} />
                  {p.status !== "approved" && <button className="text-sm text-primary" onClick={() => setEditing(p.id)}>Edit</button>}
                  <button aria-label="Delete" onClick={() => removeProduct(p.id)}><Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" /></button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}

function ProductEditor({ p, onSave, onCancel }: { p: Product; onSave: (patch: Partial<Product>) => void; onCancel: () => void }) {
  const [v, setV] = useState<Record<string, string>>(() => Object.fromEntries([...FIELDS, "description"].map((k) => [k, (p[k as keyof Product] as string) ?? ""])));
  const [img, setImg] = useState<string | null>(p.image_url);
  const pick = async (f?: File) => {
    if (!f) return;
    try { setImg(await imageFileToDataUrl(f)); } catch (e) { toast.error((e as Error).message); }
  };
  return (
    <div className="grid gap-2 rounded-xl border border-primary bg-card p-4 md:grid-cols-3">
      <div className="flex items-center gap-3 md:col-span-3">
        {img ? <img src={img} alt="" className="h-20 w-20 rounded-lg border border-border bg-background object-contain" /> : <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted"><ImagePlus className="h-5 w-5 text-muted-foreground" /></div>}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted">
          <ImagePlus className="h-4 w-4" />{img ? "Change photo" : "Add photo"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; void pick(f); }} />
        </label>
        {img && <button className="text-sm text-muted-foreground hover:text-destructive" onClick={() => setImg(null)}>Remove</button>}
      </div>
      {FIELDS.map((k) => <div key={k} className="space-y-1"><Label className="capitalize">{k === "moq" ? "MOQ" : k}</Label><Input value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} /></div>)}
      <div className="space-y-1 md:col-span-3"><Label>Description</Label><Textarea rows={2} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} /></div>
      <div className="flex gap-2 md:col-span-3">
        <Button size="sm" className="rounded-full" onClick={() => onSave({ ...Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === "name" ? x.trim() || "Untitled product" : x.trim() || null])), image_url: img })}>Save</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
