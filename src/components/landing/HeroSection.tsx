import { useState, useRef } from "react";
import { Search, ImagePlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLeadCapture } from "@/hooks/use-lead-capture";

const suggestions = [
  "Custom mailer boxes for skincare",
  "Find verified packaging manufacturers in India",
  "Source premium rigid boxes for a festive launch",
  "Starting with packaging, expanding to wider manufacturing",
];

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const { openCapture } = useLeadCapture();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openCapture();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      openCapture();
    }
  };

  return (
    <section className="relative overflow-hidden pb-24 pt-20 md:pb-32 md:pt-28">
      {/* Subtle ambient shape */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />

      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-bold leading-[1.08] tracking-tight text-heading text-balance sm:text-5xl lg:text-6xl">
            Run your D2C manufacturing through one operating layer
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-body text-pretty">
            Layer helps D2C brands source and manage manufacturing needs through one platform — starting with packaging.
            Search with text or images, match with verified manufacturers, and coordinate approvals, payments, and shipment in one workflow.
          </p>
        </div>

        {/* Search box */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-12 max-w-2xl rounded-3xl border border-border bg-surface-raised shadow-lg shadow-primary/5 transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10"
        >
          <div className="px-4 pt-4 pb-2">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  openCapture();
                }
              }}
              placeholder="Describe your manufacturing need..."
              rows={2}
              className="w-full resize-none bg-transparent text-base text-heading outline-none placeholder:text-body-muted leading-relaxed"
            />
          </div>
          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex items-center gap-1">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 rounded-full p-2 text-body-muted transition-colors hover:bg-muted"
                title="Upload reference image"
              >
                <ImagePlus className="h-5 w-5" />
              </button>
              {fileName && (
                <span className="text-xs text-body-muted truncate max-w-[120px]">{fileName}</span>
              )}
            </div>
            <Button type="submit" variant="hero" size="icon" className="rounded-full h-9 w-9">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Suggestion chips */}
        <div className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => { setQuery(s); openCapture(); }}
              className="rounded-full border border-border bg-surface-raised px-3.5 py-1.5 text-xs font-medium text-body-muted transition-all duration-150 hover:border-primary/30 hover:bg-amber-subtle hover:text-heading active:scale-[0.97]"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Platform preview */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="rounded-2xl border border-border bg-surface-raised p-1 shadow-2xl shadow-primary/5">
            <div className="rounded-xl bg-muted/50 p-6 md:p-8">
              {/* Fake platform header */}
              <div className="flex items-center gap-3 border-b border-border/60 pb-4">
                <div className="h-2.5 w-2.5 rounded-full bg-primary/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-border" />
                <div className="h-2.5 w-2.5 rounded-full bg-border" />
                <div className="ml-4 h-3 w-40 rounded bg-border" />
              </div>

              {/* Fake interface rows */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Active orders", value: "12", sub: "3 in QC" },
                  { label: "Manufacturers", value: "47", sub: "Verified" },
                  { label: "Avg. lead time", value: "18d", sub: "↓ 22% vs Q3" },
                ].map((card) => (
                  <div key={card.label} className="rounded-lg border border-border/60 bg-surface-raised p-4">
                    <p className="text-xs font-medium text-body-muted">{card.label}</p>
                    <p className="mt-1 font-heading text-2xl font-bold text-heading">{card.value}</p>
                    <p className="mt-0.5 text-xs text-body-muted">{card.sub}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {["Custom mailer box — Skincare brand", "Kraft pouch — Tea brand"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-lg border border-border/40 bg-surface-raised px-4 py-3">
                    <div className="h-8 w-8 rounded-md bg-amber-subtle" />
                    <div>
                      <p className="text-sm font-medium text-heading">{item}</p>
                      <p className="text-xs text-body-muted">In production · 4 bids</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
