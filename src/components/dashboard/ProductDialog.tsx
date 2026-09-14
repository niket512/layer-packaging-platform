import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/lib/catalogue";

type Props = {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
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

export default function ProductDialog({ product, onOpenChange }: Props) {
  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
        {product && (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">{product.name}</DialogTitle>
              <p className="text-[13px] text-muted-foreground">
                {product.manufacturer} · {product.size_label || product.capacity_raw}
              </p>
            </DialogHeader>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted p-4">
                {product.image && (
                  <img
                    src={product.image}
                    alt={`${product.name} by ${product.manufacturer}`}
                    className="mx-auto max-h-[340px] w-full object-contain"
                  />
                )}
              </div>

              <div>
                <Row label="Material" value={product.material} />
                <Row label="Capacity" value={product.capacity_raw} />
                <Row label="Other sizes" value={product.alternate_sizes_raw} />
                <Row label="Neck size" value={product.neck} />
                <Row label="Neck type" value={product.neck_type} />
                <Row label="Body diameter" value={product.diameter} />
                <Row label="Total height" value={product.height} />
                <Row label="Weight" value={product.weight} />
                <Row label="Product code" value={product.codes} />
                <Row label="Design family" value={product.design} />
                <Row label="Source" value={`${product.source_file} · p. ${product.page}`} />

                {(product.tags || []).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {product.tags.map((t) => (
                      <span key={t} className="rounded-md bg-secondary px-2 py-1 text-[11px] font-medium text-secondary-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted p-4 text-[12px] leading-relaxed text-muted-foreground">
              <p>{product.specification_status}</p>
              <p className="mt-1">Pouring performance: {product.pouring_performance}</p>
              <p className="mt-1">Closure compatibility: {product.compatibility_status}</p>
              {product.material_evidence && <p className="mt-1">Material evidence: {product.material_evidence}</p>}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
