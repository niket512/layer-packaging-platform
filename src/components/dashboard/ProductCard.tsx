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
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
      <button
        onClick={onOpen}
        className="relative aspect-[4/5] w-full overflow-hidden bg-muted"
        aria-label={`View details for ${product.name}`}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={`${product.name} by ${product.manufacturer}`}
            loading="lazy"
            className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="grid h-full place-items-center text-xs text-muted-foreground">No image</span>
        )}
        {product.review_required && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-[10px] font-semibold text-amber-700">
            <AlertTriangle className="h-3 w-3" /> Needs confirmation
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.2px] text-muted-foreground">
            {product.manufacturer}
          </p>
          <button onClick={onOpen} className="mt-1 text-left font-heading text-[15px] font-semibold leading-snug text-foreground hover:text-primary">
            {product.name}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {product.size_label && (
            <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
              {product.size_label}
            </span>
          )}
          {product.material && (
            <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {product.material}
            </span>
          )}
          {(product.tags || []).slice(0, 2).map((t) => (
            <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              {t}
            </span>
          ))}
        </div>

        <dl className="mt-auto grid grid-cols-2 gap-x-3 gap-y-1 pt-2 text-[11px] text-muted-foreground">
          {product.neck && (
            <div className="flex justify-between gap-2">
              <dt>Neck</dt>
              <dd className="font-medium text-foreground">{product.neck}</dd>
            </div>
          )}
          {product.height && (
            <div className="flex justify-between gap-2">
              <dt>Height</dt>
              <dd className="font-medium text-foreground">{product.height}</dd>
            </div>
          )}
          {product.weight && (
            <div className="flex justify-between gap-2">
              <dt>Weight</dt>
              <dd className="font-medium text-foreground">{product.weight}</dd>
            </div>
          )}
          {product.diameter && (
            <div className="flex justify-between gap-2">
              <dt>Diameter</dt>
              <dd className="font-medium text-foreground">{product.diameter}</dd>
            </div>
          )}
        </dl>

        <div className="mt-3 flex gap-2">
          <button
            onClick={onToggleSave}
            aria-pressed={saved}
            className={cn(
              "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-border text-[12px] font-semibold transition-colors",
              saved ? "border-primary bg-secondary text-primary" : "text-foreground hover:border-primary hover:text-primary",
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", saved && "fill-current")} />
            {saved ? "Saved" : "Save"}
          </button>
          <button
            onClick={onToggleCompare}
            aria-pressed={compared}
            className={cn(
              "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-border text-[12px] font-semibold transition-colors",
              compared ? "border-primary bg-secondary text-primary" : "text-foreground hover:border-primary hover:text-primary",
            )}
          >
            <Scale className="h-3.5 w-3.5" />
            {compared ? "Added" : "Compare"}
          </button>
        </div>
      </div>
    </article>
  );
}
