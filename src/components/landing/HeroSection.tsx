import { useRef, useState } from "react";
import { Search, Paperclip, X } from "lucide-react";

const chips = [
  "Stand-up pouches",
  "Custom printed wrappers",
  "Rigid boxes",
  "Labels & stickers",
  "Mailer boxes",
  "Glass & PET bottles",
];

const openForm = (query?: string, file?: File | null) => {
  document.getElementById("sign-up")?.scrollIntoView({ behavior: "smooth" });
  window.dispatchEvent(
    new CustomEvent("open-access-form", { detail: { requirement: query, file } }),
  );
};

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openForm(query, file);
  };

  const onChipClick = (label: string) => {
    setQuery(label);
    openForm(label, file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  return (
    <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 hero-bloom">
      <div className="relative mx-auto max-w-content px-[5vw] md:px-8 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Made in India · Built with brands &amp; factories we actually visit
        </div>
        <h1 className="font-heading text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-[56px]">
          <span className="text-foreground">Packaging sourcing,</span>{" "}
          <span className="text-primary underline-wobble">without the WhatsApp chaos.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-[640px] text-lg text-muted-foreground md:text-xl">
          Tell us what you need. We&rsquo;ll line up verified manufacturers, share honest quotes, and stay on the call from sample to delivery.
        </p>
        <p className="handwritten mx-auto mt-3 max-w-[640px] text-xl text-primary/80">
          — yes, a real human will read your brief.
        </p>

        <form
          onSubmit={onSubmit}
          className="mx-auto mt-10 flex h-14 w-full max-w-2xl items-center rounded-full border border-primary/40 bg-background p-1.5 shadow-[0_2px_16px_rgba(37,99,235,0.08)] focus-within:border-primary"
        >
          <Search className="ml-4 h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe what you are looking for e.g. Stand-up pouches for 500 units"
            className="h-full flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload image"
            title="Upload reference image"
            className="mr-1 inline-flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <button
            type="submit"
            aria-label="Search"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Search className="h-5 w-5" />
          </button>
        </form>

        {file && (
          <div className="mx-auto mt-3 flex max-w-2xl items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs text-foreground">
              <Paperclip className="h-3.5 w-3.5 text-primary" />
              <span className="max-w-[240px] truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                aria-label="Remove file"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-2">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChipClick(c)}
              className="inline-flex h-7 items-center rounded-full border border-primary bg-background px-3 text-[13px] text-primary transition-colors hover:bg-secondary"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
