import { useRef, useState } from "react";
import { Search, Paperclip, X } from "lucide-react";

const chips = [
  "Pouches & Sachets",
  "Custom Printed Wrappers",
  "Rigid Boxes",
  "Labels & Stickers",
  "Mailer Boxes",
  "Glass & Plastic Bottles",
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
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-28 md:pb-32 hero-bloom">
      <div className="relative mx-auto max-w-content px-5 md:px-8 text-center">
        <h1 className="font-heading text-[32px] font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-[56px]">
          <span className="text-foreground">Source </span>
          <span className="text-primary">Smarter and Faster with AI</span>
        </h1>
        <p className="mx-auto mt-4 max-w-[640px] text-[15px] leading-relaxed text-muted-foreground md:mt-6 md:text-xl">
          Find verified manufacturers, manage orders, track shipments, and handle payments — all with AI in one click
        </p>

        <form
          onSubmit={onSubmit}
          className="mx-auto mt-8 flex h-12 w-full max-w-2xl items-center rounded-full border border-primary/40 bg-background p-1 shadow-[0_2px_16px_rgba(37,99,235,0.08)] focus-within:border-primary md:mt-10 md:h-14 md:p-1.5"
        >
          <Search className="ml-3 h-4 w-4 shrink-0 text-muted-foreground md:ml-4 md:h-5 md:w-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you sourcing?"
            className="h-full min-w-0 flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground md:px-3"
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
            className="mr-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-primary md:mr-1 md:h-11 md:w-11"
          >
            <Paperclip className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          <button
            type="submit"
            aria-label="Search"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 md:h-11 md:w-11"
          >
            <Search className="h-4 w-4 md:h-5 md:w-5" />
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

        <div className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-1.5 md:gap-2">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChipClick(c)}
              className="inline-flex h-7 items-center rounded-full border border-primary bg-background px-2.5 text-[12px] text-primary transition-colors hover:bg-secondary md:px-3 md:text-[13px]"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
