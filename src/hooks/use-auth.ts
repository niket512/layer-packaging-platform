import { useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Role } from "@/lib/procure";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRole = useCallback(async (u: User | null) => {
    if (!u) {
      setRole(null);
      return;
    }
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.id).in("role", ["founder", "supplier"]).maybeSingle();
    setRole((data?.role as Role) ?? null);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setTimeout(() => void loadRole(u).finally(() => setLoading(false)), 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      void loadRole(u).finally(() => setLoading(false));
    });
    return () => sub.subscription.unsubscribe();
  }, [loadRole]);

  const chooseRole = async (r: Role, company?: string) => {
    if (!user) return;
    const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role: r });
    if (error) throw error;
    await supabase.from("profiles").upsert({ id: user.id, company: company || null, display_name: user.email });
    setRole(r);
  };

  return { user, role, loading, chooseRole, refreshRole: () => loadRole(user) };
}
