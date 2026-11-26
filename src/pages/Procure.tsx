import { useEffect, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { LayoutDashboard, FileText, ClipboardList, Users, Package, LogOut, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Overview, OrdersView, RfqsView, SuppliersView } from "@/components/procure/FounderViews";
import SupplierInvites from "@/components/procure/SupplierInvites";
import logo from "@/assets/snaplogo-orange.png";
import { cn } from "@/lib/utils";

export default function Procure() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [view, setView] = useState("overview");

  useEffect(() => {
    if (!loading && (!user || !role)) navigate("/auth", { replace: true });
  }, [loading, user, role, navigate]);

  useEffect(() => setView(role === "supplier" ? "invites" : "overview"), [role]);

  if (loading || !user || !role) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;

  const founderNav = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "rfqs", label: "RFQs", icon: FileText },
    { id: "pos", label: "Purchase orders", icon: ClipboardList },
    { id: "suppliers", label: "Suppliers", icon: Users },
  ];
  const supplierNav = [
    { id: "invites", label: "RFQ invites", icon: Inbox },
    { id: "orders", label: "My orders", icon: ClipboardList },
  ];
  const nav = role === "founder" ? founderNav : supplierNav;
  const title = nav.find((n) => n.id === view)?.label ?? "";

  return (
    <div className="min-h-screen bg-muted">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Snaplogo" className="h-7 w-7" />
          <span className="font-heading font-bold text-foreground">Snaplogo Procure</span>
          <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium capitalize text-secondary-foreground">{role}</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
          <button onClick={() => supabase.auth.signOut().then(() => navigate("/auth"))} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />Sign out
          </button>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-6 md:flex-row md:px-6">
        <nav className="flex gap-1 overflow-x-auto md:w-52 md:shrink-0 md:flex-col">
          {nav.map((n) => (
            <button key={n.id} onClick={() => setView(n.id)}
              className={cn("flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium",
                view === n.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-background")}>
              <n.icon className="h-4 w-4" />{n.label}
            </button>
          ))}
          {role === "founder" && (
            <Link to="/bottles" className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-background">
              <Package className="h-4 w-4" />Packaging catalogue
            </Link>
          )}
        </nav>
        <main className="min-w-0 flex-1">
          <h1 className="mb-4 font-heading text-2xl font-bold text-foreground">{title}</h1>
          {view === "overview" && <Overview go={setView} />}
          {view === "rfqs" && <RfqsView onPoCreated={() => setView("pos")} />}
          {view === "pos" && <OrdersView />}
          {view === "suppliers" && <SuppliersView />}
          {view === "invites" && <SupplierInvites />}
          {view === "orders" && <OrdersView supplierMode />}
        </main>
      </div>
    </div>
  );
}
