import { Logo } from "@/components/brand/Logo";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { setBrand } from "@/lib/brand-session";

export default function SignIn() {
  const [brand, setBrandInput] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = brand.trim();
    if (!value) {
      setError("Please enter your brand name");
      return;
    }
    setBrand(value);
    navigate("/bottles");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-5 py-16">
      <div className="w-full max-w-[420px] rounded-2xl border border-border bg-card p-7 card-soft md:p-9">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>

        <h1 className="mt-7 font-heading text-[26px] font-semibold tracking-tight text-foreground">
          Sign in to your dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your brand name to continue — for example, gramiyaa.
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="brand" className="text-[12px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">
              Brand name
            </label>
            <input
              id="brand"
              value={brand}
              autoFocus
              onChange={(e) => {
                setBrandInput(e.target.value);
                setError("");
              }}
              placeholder="gramiyaa"
              className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-[15px] text-foreground outline-none transition-colors focus:border-primary"
            />
            {error && <p className="mt-2 text-[13px] text-destructive">{error}</p>}
          </div>

          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-[13px] font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-[#C2410C]"
          >
            Sign In <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-muted-foreground">
          New here?{" "}
          <Link to="/" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
