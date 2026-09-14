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
  const meta = [product.size_label, (product.tags || [])[0]].filter(Boolean).join(" · ");

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-300 hover:border-primary/60">
      <div className="image-plate relative overflow-hidden">
        <button
          onClick={onOpen}
          className="block aspect-[4/5] w-full"
          aria-label={`View details for ${product.name}`}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={`${product.name} by ${product.manufacturer}`}
              loading="lazy"
              className="h-full w-full object-contain p-5 transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <span className="grid h-full place-items-center text-[11px] text-muted-foreground">No image</span>
          )}
        </button>

        {product.review_required && (
          <span className="pointer-events-none absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-tight text-foreground backdrop-blur-md">
            <AlertTriangle className="h-2.5 w-2.5" /> Confirm
          </span>
        )}

        <div className="absolute right-2.5 top-2.5 flex flex-col gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-within:opacity-100">
          <button
            onClick={onToggleSave}
            aria-pressed={saved}
            aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-full border border-border bg-card/90 backdrop-blur-md transition-colors",
              saved ? "border-primary text-primary" : "text-muted-foreground hover:text-primary",
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", saved && "fill-current")} />
          </button>
          <button
            onClick={onToggleCompare}
            aria-pressed={compared}
            aria-label={compared ? "Remove from compare" : "Add to compare"}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-full border border-border bg-card/90 backdrop-blur-md transition-colors",
              compared ? "border-primary text-primary" : "text-muted-foreground hover:text-primary",
            )}
          >
            <Scale className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 translate-y-full p-2.5 transition-transform duration-300 group-hover:translate-y-0">
          <button
            onClick={onOpen}
            className="h-8 w-full rounded-lg bg-card text-[11px] font-semibold text-foreground shadow-lg"
          >
            Quick view
          </button>
        </div>
      </div>

      <div className="p-3.5">
        <span className="block truncate text-[11px] text-muted-foreground">
          {product.manufacturer}
          {product.group ? ` · ${product.group}` : ""}
        </span>
        <button
          onClick={onOpen}
          className="mt-1 block w-full truncate text-left font-display text-[17px] leading-tight text-foreground transition-colors hover:text-primary"
        >
          {product.name} <span aria-hidden>→</span>
        </button>
        {product.material && (
          <span className="mt-2 inline-block rounded-md bg-secondary px-2 py-0.5 text-[10.5px] font-semibold text-secondary-foreground">
            {product.material}
          </span>
        )}
        <p className="mt-2 truncate text-[11px] text-muted-foreground">{meta}</p>
      </div>
    </article>
  );
}
