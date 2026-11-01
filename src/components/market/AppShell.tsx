import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/snaplogo-orange.png";
import { cn } from "@/lib/utils";

export const isAppHost = () => window.location.hostname.startsWith("app.");
export const appPath = (p: string) => (isAppHost() ? p || "/" : `/app${p}`);

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async (u: User | null) => {
    setUser(u);
    if (u) {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.id);
      setRoles((data ?? []).map((r) => r.role as string));
    } else setRoles([]);
    setLoading(false);
  };
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setTimeout(() => void load(s?.user ?? null), 0));
    supabase.auth.getSession().then(({ data }) => load(data.session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  return { user, roles, loading, reload: () => load(user) };
}

export function SignInBox({ title }: { title: string }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = mode === "signup"
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.href } })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (res.error) toast.error(res.error.message);
    else if (mode === "signup" && !res.data.session) toast.success("Check your email to confirm, then sign in");
  };
  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <Button variant="outline" className="mt-4 w-full rounded-full"
        onClick={async () => { const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin }); if (r.error) toast.error(r.error.message); }}>
        Continue with Google
      </Button>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <div className="space-y-1"><Label htmlFor="em">Email</Label><Input id="em" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="space-y-1"><Label htmlFor="pw">Password</Label><Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <Button type="submit" className="w-full rounded-full" disabled={busy}>{mode === "signin" ? "Sign in" : "Create account"}</Button>
      </form>
      <button className="mt-3 w-full text-sm text-muted-foreground hover:text-foreground" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
        {mode === "signin" ? "New here? Create an account" : "Have an account? Sign in"}
      </button>
    </div>
  );
}

export default function AppShell({ children, isAdmin, user }: { children: ReactNode; isAdmin?: boolean; user?: User | null }) {
  const navigate = useNavigate();
  const links = [
    { to: appPath(""), label: "Search" },
    { to: appPath("/store"), label: "My store" },
    ...(isAdmin ? [{ to: appPath("/admin"), label: "Admin review" }, { to: "/admin/chats", label: "Chats" }] : []),
  ];
  return (
    <div className="min-h-screen bg-muted">
      <header className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Snaplogo" className="h-7 w-7" />
            <span className="font-heading font-bold text-foreground">Snaplogo</span>
          </div>
          <nav className="flex items-center gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end
                className={({ isActive }) => cn("rounded-full px-3 py-1.5 text-sm font-medium", isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted")}>
                {l.label}
              </NavLink>
            ))}
            {user && (
              <button className="ml-2 text-sm text-muted-foreground hover:text-foreground" onClick={() => supabase.auth.signOut().then(() => navigate(appPath("")))}>
                Sign out
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">{children}</main>
    </div>
  );
}
