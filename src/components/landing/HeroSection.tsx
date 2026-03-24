import { useState, useRef } from "react";
import { ImagePlus, ArrowRight } from "lucide-react";
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
            The sourcing OS for D2C brands
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-body text-pretty">
            Find verified manufacturers, manage orders, track shipments, and handle payments — all in one platform. Starting with packaging.
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
                className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-body-muted transition-all hover:border-primary/30 hover:bg-amber-subtle hover:text-heading"
                title="Upload reference image"
              >
                <ImagePlus className="h-4 w-4" />
                <span>Add image</span>
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



      </div>
    </section>
  );
}
