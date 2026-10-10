import { useMemo, useState } from "react";
import { Factory, MapPin, CalendarDays, Info, Search } from "lucide-react";
import { manufacturerProfiles } from "@/data/manufacturers";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import logo from "@/assets/snaplogo-orange.png";

const categories = [
  { key: "all", label: "All" },
  { key: "bottles", label: "Bottles & jars (HDPE)" },
  { key: "sachets", label: "Sachets & pouches" },
] as const;

type CatKey = (typeof categories)[number]["key"];

export default function ManufacturersDirectory() {
  const [cat, setCat] = useState<CatKey>("all");
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return manufacturerProfiles.filter(
      (m) =>
        (cat === "all" || m.category === cat) &&
        (!t ||
          [m.name, m.location, ...m.capabilities, ...m.brands]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(t)),
    );
  }, [cat, q]);

  const groups = useMemo(() => {
    const order: { key: Exclude<CatKey, "all">; title: string; blurb: string }[] = [
      { key: "bottles", title: "Bottles & jars", blurb: "HDPE bottle, jar and jerry can manufacturers" },
      { key: "sachets", title: "Sachets & pouches", blurb: "Flexible packaging, sachet and stick pack makers" },
    ];
    return order
      .map((g) => ({ ...g, items: shown.filter((m) => m.category === g.key) }))
      .filter((g) => g.items.length > 0);
  }, [shown]);

  return (
    <div className="min-h-screen bg-muted">
      <header className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Snaplogo" className="h-7 w-7" />
            <span className="font-heading font-bold text-foreground">Snaplogo</span>
            <span className="hidden rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-primary sm:inline">
              Manufacturer directory
            </span>
          </div>
          <a href="mailto:contact@snapit.club" className="text-sm font-medium text-primary hover:underline">
            contact@snapit.club
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 py-10 md:px-6">
        <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
          Verified packaging manufacturers
        </h1>
        <p className="mt-2 max-w-[560px] text-muted-foreground">
          Every manufacturer in the Snaplogo network, grouped by what they make — with capabilities and the brands they have worked with.
        </p>

        <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, location, capability or brand"
            className="h-12 rounded-full bg-background pl-11"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm",
                cat === c.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <p className="mt-5 text-sm text-muted-foreground">{shown.length} manufacturers</p>

        {groups.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-background p-10 text-center text-muted-foreground">
            No manufacturers match your search.
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.key} className="mt-8">
              <h2 className="font-heading text-xl font-semibold text-foreground">{g.title}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{g.blurb}</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {g.items.map((m) => (
                  <article key={m.name} className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                        <Factory className="h-[18px] w-[18px]" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-heading text-[16px] font-semibold text-foreground">{m.name}</h3>
                        {m.location && (
                          <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted-foreground">
                            <MapPin className="h-3 w-3" /> {m.location}
                          </p>
                        )}
                        {m.established && (
                          <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted-foreground">
                            <CalendarDays className="h-3 w-3" /> Est. {m.established}
                          </p>
                        )}
                      </div>
                    </div>

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

                    {m.note && (
                      <p className="mt-4 flex items-start gap-1.5 text-[12.5px] leading-[1.6] text-muted-foreground">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        {m.note}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground md:flex-row md:px-6">
          <p>© {new Date().getFullYear()} Snaplogo</p>
          <a href="mailto:contact@snapit.club" className="text-primary hover:underline">
            contact@snapit.club
          </a>
        </div>
      </footer>
    </div>
  );
}
