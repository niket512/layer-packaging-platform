import { useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const FORMATS = ["Flat sachet", "Slim stick pack", "Pillow pouch"];
const SHAPES = ["Portrait rectangle", "Landscape rectangle", "Square", "Slim elongated"];
const OPENING_STYLES = ["Corner pour opening", "Wide top opening"];
const OPENING_FEATURES = ["Tear notch", "Serrated edge", "Controlled tear / laser score"];
const PLIES = ["2 plies", "3 plies", "Not specified"];
const SEALS = ["Three-side seal", "Four-side seal", "Back fin seal", "Back lap seal"];
const FINISHES = ["Matte", "Glossy", "Matte + glossy spot", "Metallised", "Soft touch"];

// Prototype sizes, width x height in mm including seals
const SIZES: { value: string; format: string; shape?: string }[] = [
  { value: "50 × 75 mm", format: "Flat sachet", shape: "Portrait rectangle" },
  { value: "60 × 80 mm", format: "Flat sachet", shape: "Portrait rectangle" },
  { value: "75 × 50 mm", format: "Flat sachet", shape: "Landscape rectangle" },
  { value: "80 × 60 mm", format: "Flat sachet", shape: "Landscape rectangle" },
  { value: "60 × 60 mm", format: "Flat sachet", shape: "Square" },
  { value: "30 × 100 mm", format: "Slim stick pack", shape: "Slim elongated" },
  { value: "30 × 110 mm", format: "Slim stick pack", shape: "Slim elongated" },
  { value: "45 × 70 mm", format: "Pillow pouch", shape: "Portrait rectangle" },
  { value: "50 × 75 mm ", format: "Pillow pouch", shape: "Portrait rectangle" },
];

type Selected = {
  format: string;
  shape: string;
  openingStyle: string;
  openingFeature: string;
  plies: string;
  seal: string;
  finish: string;
  size: string;
};

const empty: Selected = {
  format: "",
  shape: "",
  openingStyle: "",
  openingFeature: "",
  plies: "",
  seal: "",
  finish: "",
  size: "",
};

export default function SachetCatalogue() {
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState<Selected>(empty);

  const pick = (key: keyof Selected) => (v: string) =>
    setSel((s) => {
      const next = { ...s, [key]: v };
      if (key === "format" || key === "shape") next.size = "";
      return next;
    });

  const clear = (key: keyof Selected) => () => setSel((s) => ({ ...s, [key]: "" }));

  const sizeOptions = SIZES.filter(
    (s) => (!sel.format || s.format === sel.format) && (!sel.shape || s.shape === sel.shape),
  );

  const chips = [
    sel.format && { label: `Format: ${sel.format}`, clear: clear("format") },
    sel.shape && { label: `Shape: ${sel.shape}`, clear: clear("shape") },
    sel.openingStyle && { label: `Opening: ${sel.openingStyle}`, clear: clear("openingStyle") },
    sel.openingFeature && { label: `Opening feature: ${sel.openingFeature}`, clear: clear("openingFeature") },
    sel.plies && { label: `Plies: ${sel.plies}`, clear: clear("plies") },
    sel.seal && { label: `Seal: ${sel.seal}`, clear: clear("seal") },
    sel.finish && { label: `Finish: ${sel.finish}`, clear: clear("finish") },
    sel.size && { label: `Size: ${sel.size.trim()}`, clear: clear("size") },
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
      <span className="text-[11px] font-semibold uppercase tracking-[1.2px] text-muted-foreground">{title}</span>
      {note && <p className="mt-1 text-[11.5px] text-muted-foreground">{note}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o;
          return (
            <button
              key={o}
              onClick={() => onPick(on ? "" : o)}
              aria-pressed={on}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12.5px] transition-colors",
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

  return (
    <>
      <section>
        <h1 className="font-heading text-[34px] font-semibold leading-[1.12] tracking-tight text-foreground md:text-[38px]">
          Sachets and pouches
        </h1>
        <p className="mt-2 max-w-[560px] text-[14px] text-muted-foreground">
          Flexible packaging designs are being added. Set your pack format, seal and size preferences so we can match
          makers for you
        </p>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            aria-label="Search sachets"
            placeholder="Search pack formats, seals or sizes..."
            className="h-[50px] w-full rounded-[10px] border border-border bg-card pl-11 pr-4 text-[14px] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
        </div>

        <div className="mt-6 grid gap-5">
          {group("Pack format", FORMATS, sel.format, pick("format"))}
          {group("Body shape", SHAPES, sel.shape, pick("shape"))}
          {group("Opening style", OPENING_STYLES, sel.openingStyle, pick("openingStyle"))}
          {group("Opening feature", OPENING_FEATURES, sel.openingFeature, pick("openingFeature"))}
          {group("Structure", PLIES, sel.plies, pick("plies"))}
          {group("Seal layout", SEALS, sel.seal, pick("seal"))}
          {group("Finishing", FINISHES, sel.finish, pick("finish"))}
          {group(
            "Prototype size",
            sizeOptions.map((s) => s.value),
            sel.size,
            pick("size"),
            "Width × height in mm, including seals",
          )}
        </div>
      </section>

      {chips.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-card p-3">
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

      <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-11 text-center">
        <h3 className="font-heading text-[19px] font-semibold text-foreground">No sachet designs yet</h3>
        <p className="mx-auto mt-2 max-w-[420px] text-[13px] text-muted-foreground">
          Sachet catalogues are being onboarded. Your selections stay on screen, and designs will appear here as makers
          are added
        </p>
      </div>
    </>
  );
}
