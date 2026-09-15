import { useMemo } from "react";
import { Factory, MapPin, CalendarDays, Info } from "lucide-react";
import { products, designName } from "@/lib/catalogue";
import { manufacturerProfiles } from "@/data/manufacturers";

type Props = { category: "bottles" | "sachets" };

export default function ManufacturersView({ category }: Props) {
  const profiles = manufacturerProfiles.filter((m) => m.category === category);

  const stats = useMemo(() => {
    const map: Record<string, { count: number; shapes: string[]; min: number; max: number }> = {};
    if (category !== "bottles") return map;
    for (const p of products) {
      const s = (map[p.manufacturer] ??= { count: 0, shapes: [], min: Infinity, max: 0 });
      s.count += 1;
      if (p.design && !s.shapes.includes(p.design)) s.shapes.push(p.design);
      for (const ml of p.sizes_ml ?? []) {
        if (ml > 0) {
          s.min = Math.min(s.min, ml);
          s.max = Math.max(s.max, ml);
        }
      }
    }
    return map;
  }, [category]);

  return (
    <section>
      <h1 className="font-heading text-[34px] font-semibold leading-[1.12] tracking-tight text-foreground md:text-[38px]">
        Manufacturing profiles
      </h1>
      <p className="mt-2 max-w-[560px] text-[14px] text-muted-foreground">
        {category === "bottles"
          ? "The makers behind the bottle and jar listings, with what they run and the brands they have worked with"
          : "Sachet and pouch makers, with what they run and the brands they have worked with"}
      </p>

      {profiles.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <Factory className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-3 text-[14px] font-semibold text-foreground">No sachet makers listed yet</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Profiles appear here once sachet and pouch suppliers are added
          </p>
        </div>
      ) : (
        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((m) => {
            const s = stats[m.name];
            return (
              <article key={m.name} className="flex flex-col rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                    <Factory className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-heading text-[16px] font-semibold text-foreground">{m.name}</h2>
                    {m.location && (
                      <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {m.location}
                      </p>
                    )}
                  </div>
                </div>

                {s && s.count > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-muted p-3 text-center">
                    <div>
                      <p className="font-heading text-[16px] font-semibold text-foreground">{s.count}</p>
                      <p className="text-[10.5px] uppercase tracking-[0.8px] text-muted-foreground">Products</p>
                    </div>
                    <div>
                      <p className="font-heading text-[16px] font-semibold text-foreground">{s.shapes.length}</p>
                      <p className="text-[10.5px] uppercase tracking-[0.8px] text-muted-foreground">Shapes</p>
                    </div>
                    <div>
                      <p className="font-heading text-[16px] font-semibold text-foreground">
                        {s.max > 0 ? `${s.min.toLocaleString()}–${s.max.toLocaleString()}` : "—"}
                      </p>
                      <p className="text-[10.5px] uppercase tracking-[0.8px] text-muted-foreground">ml range</p>
                    </div>
                  </div>
                )}

                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[1.2px] text-muted-foreground">
                  Capabilities
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.capabilities.map((c) => (
                    <span key={c} className="rounded-full border border-border px-2.5 py-1 text-[11.5px] text-foreground">
                      {c}
                    </span>
                  ))}
                </div>

                {s && s.shapes.length > 0 && (
                  <>
                    <p className="mt-4 text-[11px] font-semibold uppercase tracking-[1.2px] text-muted-foreground">
                      Shapes made
                    </p>
                    <p className="mt-1.5 text-[12.5px] leading-[1.6] text-muted-foreground">
                      {s.shapes.slice(0, 6).map(designName).join(", ")}
                      {s.shapes.length > 6 ? ` +${s.shapes.length - 6} more` : ""}
                    </p>
                  </>
                )}

                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[1.2px] text-muted-foreground">
                  Brands worked with
                </p>
                {m.brands.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.brands.map((b) => (
                      <span key={b} className="rounded-full bg-secondary px-2.5 py-1 text-[11.5px] font-medium text-primary">
                        {b}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1.5 text-[12.5px] text-muted-foreground">Shared on request</p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
