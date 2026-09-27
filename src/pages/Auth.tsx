import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Factory, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/snaplogo-orange.png";
import type { Role } from "@/lib/procure";
import { cn } from "@/lib/utils";

export default function Auth() {
  const navigate = useNavigate();
  const { user, role, loading, chooseRole } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [pick, setPick] = useState<Role>("founder");
  const [company, setCompany] = useState("");

  useEffect(() => {
    if (!loading && user && role) navigate("/dashboard/procure", { replace: true });
  }, [loading, user, role, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) throw error;
        if (!data.session) toast.success("Check your email to confirm your account, then sign in");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
    if (res.error) toast.error(res.error.message);
  };

  const saveRole = async () => {
    setBusy(true);
    try {
      await chooseRole(pick, company);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const roleCard = (r: Role, title: string, sub: string, Icon: typeof Rocket) => (
    <button
      type="button"
      onClick={() => setPick(r)}
      className={cn(
        "flex flex-1 flex-col items-start gap-1 rounded-xl border p-4 text-left transition",
        pick === r ? "border-primary bg-secondary" : "border-border bg-card hover:border-primary/40",
      )}
    >
      <Icon className="h-5 w-5 text-primary" />
      <span className="text-sm font-semibold text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground">{sub}</span>
    </button>
  );

  return (
    <div className="grid min-h-screen place-items-center bg-muted px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Snaplogo" className="h-8 w-8" />
          <span className="font-heading text-lg font-bold text-foreground">Snaplogo Procure</span>
        </Link>

        {user && !role && !loading ? (
          <div className="mt-6 space-y-4">
            <h1 className="text-xl font-semibold text-foreground">How will you use Snaplogo</h1>
            <div className="flex gap-3">
              {roleCard("founder", "I'm a founder", "Source, compare quotes and track orders", Rocket)}
              {roleCard("supplier", "I'm a supplier", "Respond to RFQs and update orders", Factory)}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Company name</Label>
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Gramiyaa" />
            </div>
            {pick === "supplier" && (
              <p className="text-xs text-muted-foreground">
                You'll see RFQs from founders who added {user.email} to their supplier list
              </p>
            )}
            <Button className="w-full rounded-full" disabled={busy} onClick={saveRole}>
              Continue
            </Button>
          </div>
        ) : (
          <>
            <h1 className="mt-6 text-xl font-semibold text-foreground">
              {mode === "signin" ? "Sign in to manage procurement" : "Create your account"}
            </h1>
            <Button variant="outline" className="mt-5 w-full rounded-full" onClick={google}>
              Continue with Google
            </Button>
            <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={busy}>
                {mode === "signin" ? "Sign in" : "Sign up"}
              </Button>
            </form>
            <button
              className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
