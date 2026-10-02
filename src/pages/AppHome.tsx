import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import AppShell, { useSession } from "@/components/market/AppShell";
import { cn } from "@/lib/utils";

type Row = {
  id: string; name: string; category: string | null; material: string | null; capacity: string | null;
  dimensions: string | null; moq: string | null; description: string | null; image_url: string | null;
  stores: { name: string; location: string | null } | null;
};

export default function AppHome() {
  const { user, roles } = useSession();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("market_products")
      .select("id,name,category,material,capacity,dimensions,moq,description,stores!inner(name,location,status)")
      .eq("status", "approved").eq("stores.status", "approved").order("created_at", { ascending: false }).limit(1000)
      .then(({ data }) => { setRows((data as unknown as Row[]) ?? []); setLoading(false); });
  }, []);

  const cats = useMemo(() => [...new Set(rows.map((r) => r.category).filter(Boolean))] as string[], [rows]);
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter((r) => (!cat || r.category === cat) &&
      (!t || [r.name, r.category, r.material, r.capacity, r.description, r.stores?.name, r.stores?.location].join(" ").toLowerCase().includes(t)));
  }, [rows, q, cat]);

  return (
    <AppShell user={user} isAdmin={roles.includes("admin")}>
      <h1 className="font-heading text-3xl font-bold text-foreground">Search every catalogue</h1>
      <p className="mt-1 text-muted-foreground">Products from verified manufacturers, in one place.</p>
      <div className="relative mt-5">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by product, material, capacity or manufacturer" className="h-12 rounded-full bg-background pl-11" />
      </div>
      {cats.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {[null, ...cats].map((c) => (
            <button key={c ?? "all"} onClick={() => setCat(c)}
              className={cn("rounded-full border px-3 py-1 text-sm", cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground")}>
              {c ?? "All"}
            </button>
          ))}
        </div>
      )}
      <p className="mt-5 text-sm text-muted-foreground">{loading ? "Loading…" : `${shown.length} products`}</p>
      {!loading && rows.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-background p-10 text-center text-muted-foreground">
          No catalogues published yet. Manufacturers can add theirs from My store.
        </div>
      ) : (
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              {r.image_url && <img src={r.image_url} alt={r.name} loading="lazy" className="mb-3 aspect-square w-full rounded-xl bg-background object-contain" />}
              {r.category && <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">{r.category}</span>}
              <h3 className="mt-1 font-semibold text-foreground">{r.name}</h3>
              <p className="text-sm text-muted-foreground">{r.stores?.name}{r.stores?.location ? ` · ${r.stores.location}` : ""}</p>
              <dl className="mt-3 space-y-1 text-sm">
                {([["Material", r.material], ["Capacity", r.capacity], ["Size", r.dimensions], ["MOQ", r.moq]] as const).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="flex gap-2"><dt className="w-20 text-muted-foreground">{k}</dt><dd className="text-foreground">{v}</dd></div>
                ))}
              </dl>
              {r.description && <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
