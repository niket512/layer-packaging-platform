import { Heart, AlertTriangle } from "lucide-react";
import { designName, type Product } from "@/lib/catalogue";
import { cn } from "@/lib/utils";

type Props = {
  product: Product;
  saved: boolean;
  compared: boolean;
  onToggleSave: () => void;
  onToggleCompare: () => void;
  onOpen: () => void;
};

export default function ProductCard({ product, saved, compared, onToggleSave, onToggleCompare, onOpen }: Props) {
  const sizes = product.size_label || product.capacity_raw;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/60">
      <div className="relative">
        <button
          onClick={onOpen}
          className="image-plate flex h-[150px] w-full items-center justify-center p-3"
          aria-label={`View details for ${product.name}`}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={`${product.name} by ${product.manufacturer}`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-[11px] text-muted-foreground">No image</span>
          )}
        </button>

        {product.review_required && (
          <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 text-[9px] font-bold uppercase text-foreground">
            <AlertTriangle className="h-2.5 w-2.5" /> Confirm
          </span>
        )}

        <button
          onClick={onToggleSave}
          aria-pressed={saved}
          aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
          className={cn(
            "absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border border-border bg-card transition-colors",
            saved ? "border-primary bg-primary text-primary-foreground" : "text-foreground hover:text-primary",
          )}
        >
          <Heart className={cn("h-3.5 w-3.5", saved && "fill-current")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <span className="truncate text-[11px] uppercase tracking-[0.6px] text-muted-foreground">
          {product.manufacturer}
        </span>
        <button
          onClick={onOpen}
          className="block w-full truncate text-left text-[13.5px] font-semibold leading-tight text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </button>
        {sizes && <p className="truncate text-[12px] text-muted-foreground">{sizes}</p>}
        {product.material && (
          <span className="inline-block w-fit rounded bg-secondary px-1.5 py-0.5 text-[10.5px] font-semibold uppercase text-secondary-foreground">
            {product.material}
          </span>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-2 text-[11px] text-muted-foreground">
          <span className="truncate">{product.design ? designName(product.design) : ""}</span>
          <label className="flex shrink-0 cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={compared}
              onChange={onToggleCompare}
              className="h-3.5 w-3.5 accent-[hsl(var(--primary))]"
              aria-label={`Compare ${product.name}`}
            />
            Compare
          </label>
        </div>
      </div>
    </article>
  );
}
