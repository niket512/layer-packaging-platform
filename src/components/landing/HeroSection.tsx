import { useRef, useState } from "react";
import { Search, Paperclip, X, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

const chips = [
  "Pouches & Sachets",
  "Custom Wrappers",
  "Rigid Boxes",
  "Labels & Stickers",
  "Mailer Boxes",
  "Bottles",
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
    <section className="relative overflow-hidden pt-10 pb-14 md:pt-20 md:pb-28 hero-bloom">
      <div className="relative mx-auto max-w-content px-5 md:px-8">
        <div className="grid items-center gap-10 md:grid-cols-[1.05fr_1fr] md:gap-14">
          {/* LEFT — Editorial copy */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[1.2px] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI procurement for D2C
            </div>

            <h1 className="mt-5 font-heading text-[40px] font-bold leading-[1.02] tracking-[-0.02em] text-foreground sm:text-[56px] md:text-[68px] lg:text-[76px]">
              Source <span className="text-primary">smarter</span>,{" "}
              <br className="hidden sm:block" />
              ship <span className="text-primary">faster</span>.
            </h1>

            <p className="mx-auto mt-5 max-w-[560px] text-[15px] leading-relaxed text-muted-foreground md:mx-0 md:mt-6 md:text-[18px]">
              Snaplogo's AI agents find verified manufacturers, manage samples, track orders, and handle payments — so your packaging ships on time, every time.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <button
                onClick={() => openForm()}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[13px] font-bold uppercase tracking-wider text-primary-foreground transition-all hover:bg-[#C2410C] hover:shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.6)]"
              >
                Sign Up <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#how-it-works"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-background px-6 text-[13px] font-bold uppercase tracking-wider text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                See how it works
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-muted-foreground md:justify-start">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Verified manufacturers</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> 50% faster sourcing</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> No credit card</span>
            </div>
          </div>

          {/* RIGHT — Product mockup */}
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/10 via-transparent to-primary/5 blur-2xl" />
            <div className="rounded-2xl border border-border bg-card p-3 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)] md:p-4">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 px-2 pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                <div className="ml-3 hidden flex-1 rounded-md bg-muted px-3 py-1 text-[11px] text-muted-foreground sm:block">
                  app.snaplogo.in / sourcing / pouches-q3
                </div>
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> Live
                </span>
              </div>

              {/* Step pills */}
              <div className="flex items-center justify-between gap-1 rounded-xl bg-muted/60 p-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {["Brief", "Match", "Sample", "Order", "Delivery"].map((s, i) => (
                  <div
                    key={s}
                    className={`flex-1 rounded-lg px-2 py-1.5 text-center ${i === 0 ? "bg-background text-primary shadow-sm" : ""}`}
                  >
                    {s}
                  </div>
                ))}
              </div>

              {/* Search inside mockup */}
              <form
                onSubmit={onSubmit}
                className="mt-4 flex items-center rounded-xl border border-primary/40 bg-background p-1.5 focus-within:border-primary"
              >
                <Search className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Describe what you're sourcing…"
                  className="h-9 min-w-0 flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload image"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <button
                  type="submit"
                  aria-label="Search"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[11px] font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-[#C2410C]"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Ask AI
                </button>
              </form>

              {/* Parsed brief preview */}
              <div className="mt-4 space-y-2 rounded-xl bg-muted/50 p-3">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  <Sparkles className="h-3 w-3" /> AI Parsed Brief
                </div>
                <dl className="grid grid-cols-2 gap-y-1.5 text-[12px]">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="text-right font-semibold text-foreground">Stand-up Pouches</dd>
                  <dt className="text-muted-foreground">Quantity</dt>
                  <dd className="text-right font-semibold text-foreground">10,000 units</dd>
                  <dt className="text-muted-foreground">Material</dt>
                  <dd className="text-right font-semibold text-foreground">Food-grade laminate</dd>
                  <dt className="text-muted-foreground">Lead time</dt>
                  <dd className="text-right font-semibold text-foreground">{`< 21 days`}</dd>
                </dl>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5">
                <div className="flex items-center gap-2 text-[12px]">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground">12 verified matches</span>
                  <span className="text-muted-foreground">in Mumbai, Delhi, Bengaluru</span>
                </div>
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {file && (
          <div className="mt-4 flex items-center justify-center md:justify-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs text-foreground">
              <Paperclip className="h-3.5 w-3.5 text-primary" />
              <span className="max-w-[240px] truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                aria-label="Remove file"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Quick category chips */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 md:justify-start">
          <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">Popular →</span>
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChipClick(c)}
              className="inline-flex h-8 items-center rounded-full border border-border bg-background px-3 text-[12px] text-foreground transition-colors hover:border-primary hover:bg-secondary hover:text-primary md:text-[13px]"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
