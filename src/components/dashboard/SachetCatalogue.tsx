import { useMemo, useState } from "react";
import { Heart, Layers, Printer, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import raw from "@/data/sachets.json";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type Sachet = {
  id: string;
  name: string;
  format: string;
  shape: string;
  openingStyle: string;
  openingFeature: string;
  plies: string;
  seal: string;
  finish: string;
  size: string;
  use: string;
  material: string;
  surfaceFinish: string;
  image?: string;
};

const sachets = raw as Sachet[];

const FORMATS = ["Flat sachet", "Slim stick pack", "Pillow pouch"];
const SHAPES = ["Portrait rectangle", "Landscape rectangle", "Square", "Slim elongated"];
const OPENING_STYLES = ["Corner pour opening", "Wide top opening"];
const OPENING_FEATURES = ["Tear notch", "Serrated edge", "Controlled tear / laser score"];
const PLIES = ["2 plies", "3 plies", "Not specified"];
const SEALS = ["Three-side seal", "Four-side seal", "Back fin seal", "Back lap seal"];

type Selected = {
  format: string;
  shape: string;
  openingStyle: string;
  openingFeature: string;
  plies: string;
  seal: string;
  size: string;
};

const empty: Selected = {
  format: "",
  shape: "",
  openingStyle: "",
  openingFeature: "",
  plies: "",
  seal: "",
  size: "",
};

const BLANK: Record<string, string> = {
  "Slim stick pack": "blank-stick",
  "Pillow pouch": "blank-pillow",
  "Flat sachet": "blank-flat-landscape",
};

const blankFor = (s: Sachet) =>
  s.shape === "Square" ? "blank-flat-square" : BLANK[s.format] ?? "blank-flat-landscape";

const img = (s: Sachet) => `/sachets/${s.image ?? s.id}.jpg`;
const thumb = (s: Sachet) => `/sachets/thumb/${s.image ?? s.id}.webp`;
const fallback = (s: Sachet, full: boolean) => (e: { currentTarget: HTMLImageElement }) => {
  const el = e.currentTarget;
  const next = full ? `/sachets/${blankFor(s)}.jpg` : `/sachets/thumb/${blankFor(s)}.webp`;
  if (!el.src.endsWith(next)) el.src = next;
};

type Props = {
  savedIds?: string[];
  onToggleSave?: (id: string) => void;
  savedOnly?: boolean;
};

export default function SachetCatalogue({ savedIds = [], onToggleSave, savedOnly = false }: Props) {
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState<Selected>(empty);
  const [detail, setDetail] = useState<Sachet | null>(null);

  const pick = (key: keyof Selected) => (v: string) =>
    setSel((s) => {
      const next = { ...s, [key]: v };
      if (key === "format" || key === "shape") next.size = "";
      if (key === "format" && v && next.shape && !sachets.some((z) => z.format === v && z.shape === next.shape)) {
        next.shape = "";
      }
      return next;
    });

  const clear = (key: keyof Selected) => () => setSel((s) => ({ ...s, [key]: "" }));

  const sizeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          sachets
            .filter((s) => (!sel.format || s.format === sel.format) && (!sel.shape || s.shape === sel.shape))
            .map((s) => s.size),
        ),
      ).sort(),
    [sel.format, sel.shape],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sachets.filter((s) => {
      if (savedOnly && !savedIds.includes(s.id)) return false;
      if (sel.format && s.format !== sel.format) return false;
      if (sel.shape && s.shape !== sel.shape) return false;
      if (sel.openingStyle && s.openingStyle !== sel.openingStyle) return false;
      if (sel.openingFeature && s.openingFeature !== sel.openingFeature) return false;
      if (sel.plies && s.plies !== sel.plies) return false;
      if (sel.seal && s.seal !== sel.seal) return false;
      if (sel.size && s.size !== sel.size) return false;
      if (q) {
        const hay = [s.name, s.format, s.shape, s.seal, s.finish, s.size, s.use].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [sel, query, savedOnly, savedIds]);

  const chips = [
    sel.format && { label: `Format: ${sel.format}`, clear: clear("format") },
    sel.shape && { label: `Shape: ${sel.shape}`, clear: clear("shape") },
    sel.openingStyle && { label: `Opening: ${sel.openingStyle}`, clear: clear("openingStyle") },
    sel.openingFeature && { label: `Opening feature: ${sel.openingFeature}`, clear: clear("openingFeature") },
    sel.plies && { label: `Plies: ${sel.plies}`, clear: clear("plies") },
    sel.seal && { label: `Seal: ${sel.seal}`, clear: clear("seal") },
    sel.size && { label: `Size: ${sel.size}`, clear: clear("size") },
    query.trim() && { label: `Search: ${query.trim()}`, clear: () => setQuery("") },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const group = (
    title: string,
    options: string[],
    value: string,
    onPick: (v: string) => void,
    note?: string,
  ) => (
    <div>
      <span className="text-[10.5px] font-semibold uppercase tracking-[1.2px] text-muted-foreground">{title}</span>
      {note && <span className="ml-2 text-[11px] text-muted-foreground">{note}</span>}
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = value === o;
          return (
            <button
              key={o}
              onClick={() => onPick(on ? "" : o)}
              aria-pressed={on}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[12px] transition-colors",
                on
                  ? "border-primary bg-secondary font-semibold text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/50",
              )}
            >
              {o.trim()}
            </button>
          );
        })}
      </div>
    </div>
  );

  const Row = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
      <div className="flex justify-between gap-4 border-b border-border/70 py-2 text-[13px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-right font-medium text-foreground">{value}</span>
      </div>
    );
  };

  return (
    <>
      {!savedOnly && (<><section>
        <h1 className="font-heading text-[24px] font-semibold leading-[1.15] tracking-tight text-foreground md:text-[28px]">
          Sachets and pouches
        </h1>
        <p className="mt-1 max-w-[560px] text-[13px] text-muted-foreground">
          {sachets.length} flexible packs, classified by format, seal and size so you can shortlist a structure and we
          match makers for you
        </p>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            aria-label="Search sachets"
            placeholder="Search pack formats, seals or sizes..."
            className="h-10 w-full rounded-[10px] border border-border bg-card pl-10 pr-4 text-[13.5px] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
        </div>

        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          {group("Pack format", FORMATS, sel.format, pick("format"))}
          {group("Body shape", SHAPES, sel.shape, pick("shape"))}
          {group("Opening style", OPENING_STYLES, sel.openingStyle, pick("openingStyle"))}
          {group("Opening feature", OPENING_FEATURES, sel.openingFeature, pick("openingFeature"))}
          {group("Structure", PLIES, sel.plies, pick("plies"))}
          {group("Seal layout", SEALS, sel.seal, pick("seal"))}
          {group("Prototype size", sizeOptions, sel.size, pick("size"), "Width × height in mm, including seals")}
        </div>
      </section>

      {!savedOnly && chips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-card p-2.5">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-[1.2px] text-muted-foreground">
            Active filters
          </span>
          {chips.map((c) => (
            <button
              key={c.label}
              onClick={c.clear}
              aria-label={`Remove filter ${c.label}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11.5px] text-secondary-foreground transition-colors hover:text-primary"
            >
              {c.label} <X className="h-3 w-3" />
            </button>
          ))}
          <button
            onClick={() => {
              setSel(empty);
              setQuery("");
            }}
            className="ml-1 text-[11.5px] font-semibold text-primary hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      <p className="mt-4 text-[12.5px] text-muted-foreground">
        {results.length} {results.length === 1 ? "design" : "designs"}
      </p>

      {results.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-border bg-card p-11 text-center">
          <h3 className="font-heading text-[19px] font-semibold text-foreground">No designs match these choices</h3>
          <p className="mx-auto mt-2 max-w-[420px] text-[13px] text-muted-foreground">
            Remove a filter to widen the search, or tell us the structure you need and we will source it
          </p>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {results.map((s) => (
            <div
              key={s.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-card text-left transition-colors hover:border-primary/60"
            >
              {onToggleSave && (
                <button
                  onClick={() => onToggleSave(s.id)}
                  aria-label={savedIds.includes(s.id) ? "Remove from shortlist" : "Save to shortlist"}
                  className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full border border-border bg-card/90 text-muted-foreground transition-colors hover:text-primary"
                >
                  <Heart
                    className={cn("h-4 w-4", savedIds.includes(s.id) && "fill-primary text-primary")}
                  />
                </button>
              )}
              <button onClick={() => setDetail(s)} className="block w-full text-left">
              <div className="h-[150px] overflow-hidden bg-secondary">
                <img
                  src={thumb(s)}
                  alt={s.name}
                  loading="lazy"
                  onError={fallback(s, false)}
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-2.5">
                <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-foreground">{s.name}</h3>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  {s.format} · {s.size}
                </p>
              </div>
              </button>
            </div>
          ))}
        </div>
      )}

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent side="right" className="w-[min(94vw,480px)] overflow-y-auto p-6">
          {detail && (
            <>
              <SheetHeader className="text-left">
                <SheetTitle className="font-heading text-xl">{detail.name}</SheetTitle>
                <p className="text-[13px] text-muted-foreground">
                  {detail.format} · {detail.size}
                </p>
              </SheetHeader>

              <div className="image-plate mt-4 grid place-items-center rounded-xl p-4">
                <img
                  src={img(detail)}
                  alt={detail.name}
                  onError={fallback(detail, true)}
                  className="max-h-[260px] w-full object-contain"
                />
              </div>

              <div className="mt-5">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[1.2px] text-muted-foreground">
                  Specifications
                </p>
                <Row label="Material" value={detail.material} />
                <Row label="Surface finish" value={detail.surfaceFinish} />
                <Row label="Pack format" value={detail.format} />
                <Row label="Body shape" value={detail.shape} />
                <Row label="Opening style" value={detail.openingStyle} />
                <Row label="Opening feature" value={detail.openingFeature} />
                <Row label="Structure" value={detail.plies} />
                <Row label="Seal layout" value={detail.seal} />
                <Row label="Finishing" value={detail.finish} />
                <Row label="Prototype size" value={detail.size} />
                <Row label="Typical use" value={detail.use} />
              </div>

              <div className="mt-5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[1.2px] text-muted-foreground">
                  Available customisations
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1.5 text-[12px] font-medium text-secondary-foreground">
                    <Layers className="h-3.5 w-3.5" /> Custom material
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1.5 text-[12px] font-medium text-secondary-foreground">
                    <Printer className="h-3.5 w-3.5" /> Custom print
                  </span>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
