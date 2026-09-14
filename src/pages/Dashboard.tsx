import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBrand, clearBrand } from "@/lib/brand-session";

export default function Dashboard() {
  const navigate = useNavigate();
  const brand = getBrand();

  useEffect(() => {
    if (!brand) {
      navigate("/signin", { replace: true });
    }
  }, [brand, navigate]);

  const onSignOut = () => {
    clearBrand();
    navigate("/signin", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5">
      <p className="text-sm text-muted-foreground">Signed in as {brand}</p>
      <button
        onClick={onSignOut}
        className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-border px-5 text-[12px] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
      >
        Sign out
      </button>
    </div>
  );
}
