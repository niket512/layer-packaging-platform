import { Heart, Scale, AlertTriangle } from "lucide-react";
import type { Product } from "@/lib/catalogue";
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
    <article className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-300 hover:border-primary/60">
      <div className="relative p-3 pb-0">
        <button
          onClick={onOpen}
          className="image-plate block aspect-[4/3] w-full overflow-hidden rounded-xl"
          aria-label={`View details for ${product.name}`}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={`${product.name} by ${product.manufacturer}`}
              loading="lazy"
              className="h-full w-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <span className="grid h-full place-items-center text-[11px] text-muted-foreground">No image</span>
          )}
        </button>

        {product.review_required && (
          <span className="pointer-events-none absolute left-5 top-5 inline-flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-tight text-foreground backdrop-blur-md">
            <AlertTriangle className="h-2.5 w-2.5" /> Confirm
          </span>
        )}

        <div className="absolute right-5 top-5 flex flex-col gap-2">
          <button
            onClick={onToggleSave}
            aria-pressed={saved}
            aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
            className={cn(
              "grid h-9 w-9 place-items-center rounded-full border border-border bg-card/90 backdrop-blur-md transition-colors",
              saved ? "border-primary text-primary" : "text-foreground hover:text-primary",
            )}
          >
            <Heart className={cn("h-4 w-4", saved && "fill-current")} />
          </button>
          <button
            onClick={onToggleCompare}
            aria-pressed={compared}
            aria-label={compared ? "Remove from compare" : "Add to compare"}
            className={cn(
              "grid h-9 w-9 place-items-center rounded-full border border-border bg-card/90 backdrop-blur-md transition-colors md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100",
              compared ? "border-primary text-primary opacity-100 md:opacity-100" : "text-foreground hover:text-primary",
            )}
          >
            <Scale className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <span className="block truncate text-[12px] text-muted-foreground">{product.manufacturer}</span>
        <button
          onClick={onOpen}
          className="mt-1 block w-full truncate text-left font-heading text-[16px] font-semibold text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </button>
        {sizes && <p className="mt-1 truncate text-[13px] text-muted-foreground">{sizes}</p>}
        {product.material && (
          <span className="mt-2.5 inline-block rounded-md bg-secondary px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-secondary-foreground">
            {product.material}
          </span>
        )}
      </div>
    </article>
  );
}
