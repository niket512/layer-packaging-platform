import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AppShell, { SignInBox, useSession } from "@/components/market/AppShell";
import type { Database } from "@/integrations/supabase/types";

type Store = Database["public"]["Tables"]["stores"]["Row"];
type Product = Database["public"]["Tables"]["market_products"]["Row"] & { stores: { name: string } | null };

export default function AppAdmin() {
  const { user, roles, loading } = useSession();
  const isAdmin = roles.includes("admin");
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const refresh = useCallback(async () => {
    const [s, p] = await Promise.all([
      supabase.from("stores").select("*").order("created_at", { ascending: false }),
      supabase.from("market_products").select("*, stores(name)").eq("status", "pending").order("created_at").limit(500),
    ]);
    setStores(s.data ?? []);
    setProducts((p.data as unknown as Product[]) ?? []);
  }, []);
  useEffect(() => { if (isAdmin) void refresh(); }, [isAdmin, refresh]);

  if (loading) return <AppShell><p className="text-muted-foreground">Loading…</p></AppShell>;
  if (!user) return <AppShell><SignInBox title="Admin sign in" /></AppShell>;
  if (!isAdmin) return <AppShell user={user}><p className="text-muted-foreground">You don't have admin access.</p></AppShell>;

  const setStore = async (id: string, status: string) => {
    const { error } = await supabase.from("stores").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else void refresh();
  };
  const setProducts_ = async (ids: string[], status: string) => {
    if (!ids.length) return;
    const { error } = await supabase.from("market_products").update({ status }).in("id", ids);
    if (error) toast.error(error.message); else { toast.success(`${ids.length} ${status}`); void refresh(); }
  };

  return (
    <AppShell user={user} isAdmin>
      <h1 className="font-heading text-3xl font-bold text-foreground">Admin review</h1>

      <h2 className="mt-6 font-semibold text-foreground">Manufacturer stores</h2>
      <div className="mt-2 space-y-2">
        {stores.length === 0 && <p className="text-sm text-muted-foreground">No stores yet.</p>}
        {stores.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">{s.name} <span className="ml-1 text-xs capitalize text-muted-foreground">· {s.status}</span></p>
              <p className="truncate text-xs text-muted-foreground">{[s.location, s.categories].filter(Boolean).join(" · ")}</p>
            </div>
            {s.status !== "approved" && <Button size="sm" className="rounded-full" onClick={() => setStore(s.id, "approved")}>Approve</Button>}
            {s.status !== "rejected" && <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStore(s.id, "rejected")}>Reject</Button>}
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-foreground">Products waiting ({products.length})</h2>
        {products.length > 0 && <Button size="sm" className="rounded-full" onClick={() => setProducts_(products.map((p) => p.id), "approved")}>Approve all</Button>}
      </div>
      <div className="mt-2 space-y-2">
        {products.length === 0 && <p className="text-sm text-muted-foreground">Nothing to review.</p>}
        {products.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            {p.image_url ? <img src={p.image_url} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-border bg-background object-contain" /> : <div className="h-12 w-12 shrink-0 rounded-lg bg-muted" />}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">{p.name}</p>
              <p className="truncate text-xs text-muted-foreground">{[p.stores?.name, p.category, p.material, p.capacity, p.dimensions].filter(Boolean).join(" · ")}</p>
            </div>
            <Button size="sm" className="rounded-full" onClick={() => setProducts_([p.id], "approved")}>Approve</Button>
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => setProducts_([p.id], "rejected")}>Reject</Button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
