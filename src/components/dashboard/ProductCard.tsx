import { Heart, AlertTriangle } from "lucide-react";
import { designName, type Product } from "@/lib/catalogue";
import { thumbUrl } from "@/lib/catalogue";
import { cn } from "@/lib/utils";

type Props = {
  product: Product;
  saved: boolean;
  onToggleSave: () => void;
  onOpen: () => void;
};

export default function ProductCard({ product, saved, onToggleSave, onOpen }: Props) {

  const sizes = product.sizes_ml?.length
    ? product.sizes_ml.map((s) => `${s.toLocaleString()} ml`).join(" · ")
    : product.size_label || product.capacity_raw;


  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-150 hover:border-primary/30 hover:shadow-[0_5px_20px_hsl(var(--primary)/0.10)]">
      <div className="relative">
        <button
          onClick={onOpen}
          className="image-plate flex h-[192px] w-full items-center justify-center px-4 py-4"
          aria-label={`View details for ${product.name}`}
        >
          {product.image ? (
            <img
              src={thumbUrl(product.image)}
              alt={`${product.name} by ${product.manufacturer}`}
              loading="lazy"
              decoding="async"
              width={400}
              height={400}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-[12px] text-muted-foreground">No image</span>
          )}
        </button>

        {product.review_required && (
          <span className="pointer-events-none absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded bg-card/95 px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
            <AlertTriangle className="h-2.5 w-2.5" /> Confirm
          </span>
        )}

        <button
          onClick={onToggleSave}
          aria-pressed={saved}
          aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
          className={cn(
            "absolute right-2.5 top-2.5 grid h-[30px] w-[30px] place-items-center rounded-full transition-colors",
            saved ? "bg-primary text-primary-foreground" : "bg-card/95 text-muted-foreground hover:text-primary",
          )}
        >
          <Heart className={cn("h-4 w-4", saved && "fill-current")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="truncate text-[10px] uppercase tracking-[1px] text-muted-foreground">
          {product.manufacturer}
        </span>
        <button
          onClick={onOpen}
          className="block w-full truncate text-left text-[14px] font-semibold leading-[1.35] text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </button>
        {sizes && <p className="truncate text-[12px] text-muted-foreground">Listed capacity {sizes}</p>}

        {product.material && (
          <span className="inline-flex w-fit items-center rounded bg-secondary px-1.5 py-1 text-[11px] font-medium text-secondary-foreground">
            {product.material}
          </span>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
          <span className="truncate">{product.design ? designName(product.design) : ""}</span>
        </div>

      </div>
    </article>
  );
}
