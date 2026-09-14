import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/catalogue";
import { cn } from "@/lib/utils";

type Props = {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
  saved?: boolean;
  onToggleSave?: () => void;
};

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-border/70 py-2 text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

export default function ProductDialog({ product, onOpenChange, saved, onToggleSave }: Props) {

  const sizes = product?.sizes_ml?.length
    ? product.sizes_ml.map((s) => `${s.toLocaleString()} ml`).join(" · ")
    : product?.capacity_raw;

  return (
    <Sheet open={!!product} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[min(94vw,480px)] overflow-y-auto p-6">
        {product && (
          <>
            <SheetHeader className="text-left">
              <SheetTitle className="font-heading text-xl">{product.name}</SheetTitle>
              <p className="text-[13px] text-muted-foreground">
                {product.manufacturer}
                {product.capacity_raw ? ` · listed capacity ${product.capacity_raw}` : ""}
              </p>
            </SheetHeader>

            <div className="image-plate mt-4 grid place-items-center rounded-xl p-4">
              {product.image && (
                <img
                  src={product.image}
                  alt={`${product.name} by ${product.manufacturer}`}
                  className="max-h-[260px] w-full object-contain"
                />
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={onToggleSave}
                className={cn(
                  "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border text-[12.5px] font-semibold transition-colors",
                  saved ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:border-primary",
                )}
              >
                <Heart className={cn("h-4 w-4", saved && "fill-current")} />
                {saved ? "Saved" : "Save"}
              </button>
              <button
                onClick={onToggleCompare}
                className={cn(
                  "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border text-[12.5px] font-semibold transition-colors",
                  compared ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:border-primary",
                )}
              >
                <Scale className="h-4 w-4" />
                {compared ? "In compare" : "Compare"}
              </button>
            </div>

            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[1.2px] text-muted-foreground">
                Available sizes
              </p>
              <p className="mt-1 text-[13px] font-medium text-foreground">{sizes || "—"}</p>
              {product.alternate_sizes_raw && (
                <p className="mt-1 text-[12px] text-muted-foreground">Also listed: {product.alternate_sizes_raw}</p>
              )}
            </div>

            <div className="mt-5">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[1.2px] text-muted-foreground">
                Specifications
              </p>
              <Row label="Material" value={product.material} />
              <Row label="Listed capacity" value={product.capacity_raw} />
              <Row label="Neck size" value={product.neck} />
              <Row label="Neck type" value={product.neck_type} />
              <Row label="Body diameter" value={product.diameter} />
              <Row label="Total height" value={product.height} />
              <Row label="Weight" value={product.weight} />
              <Row label="Shape family" value={product.design} />
              <Row label="Source" value={product.manufacturer} />
            </div>

            {(product.tags || []).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {product.tags.map((t) => (
                  <span key={t} className="rounded-md bg-secondary px-2 py-1 text-[11px] font-medium text-secondary-foreground">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
