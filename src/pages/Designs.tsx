import { Link, useNavigate } from "@/lib/router-compat";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CorrugatedDesigns } from "@/components/sourcing/CorrugatedDesigns";
import type { PackagingDesign, PackagingFamily } from "@/components/sourcing/packaging-catalogue";
import logo from "@/assets/snaplogo-orange.png";

export const DESIGN_PREFILL_KEY = "snaplogo.design-prefill";

export default function Designs({ onlyFamily }: { onlyFamily?: PackagingFamily }) {
  const navigate = useNavigate();

  const useDesign = (prefill: string, designs: PackagingDesign[]) => {
    try {
      sessionStorage.setItem(DESIGN_PREFILL_KEY, JSON.stringify({ prefill, designs }));
    } catch {
      // Storage full or unavailable — the prefill text still carries the reference.
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 flex h-12 items-center gap-2 border-b border-border bg-card/90 px-4 backdrop-blur md:h-16 md:px-10">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <img src={logo} alt="" className="h-6 w-6" />snaplogo<span className="text-primary">.</span>
        </Link>
        <Button asChild variant="ghost" size="sm" className="ml-auto text-muted-foreground">
          <Link to="/"><ArrowLeft />Back to sourcing</Link>
        </Button>
      </header>
      <main className="mx-auto max-w-[1000px] px-4 pb-12 pt-8 md:px-10 md:pt-12">
        <h1 className="text-2xl font-bold tracking-tight md:text-4xl">{onlyFamily === "pouches" ? "Flexible pouch designs" : "Packaging design gallery"}</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {onlyFamily === "pouches" ? "Stand-up pouches, sachets and more — find a reference for your next packaging order." : "Browse corrugated box and flexible pouch references. Pick a design to start a sourcing request with it attached."}
        </p>
        {!onlyFamily && <Button asChild variant="link" className="mt-2 px-0"><Link to="/designs/flexible-pouches">Browse flexible pouch designs</Link></Button>}
        <div className="mt-6">
          <CorrugatedDesigns key={onlyFamily ?? "all"} onUseDesign={useDesign} onlyFamily={onlyFamily} />
        </div>
        <nav aria-label="Packaging advice" className="mt-8 flex flex-wrap gap-4 border-t border-border pt-6 text-sm text-primary"><Link to="/blog/packaging-specification-sheet-template">Prepare your packaging specification sheet</Link><Link to="/blog/custom-corrugated-boxes-pricing-guide">Understand custom corrugated box prices</Link><Link to="/blog">All packaging guides</Link></nav>
      </main>
    </div>
  );
}
