import { useEffect, useRef, useState } from "react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Sparkles, Search, MapPin, Package, Clock, BadgeCheck } from "lucide-react";

type Match = {
  name: string;
  location: string;
  moq: string;
  lead: string;
  match: number;
  tag: string;
};

const scenarios: { query: string; results: Match[] }[] = [
  {
    query: "Kraft stand-up pouches, 5,000 units, food-grade",
    results: [
      { name: "Pune FlexPack Co.", location: "Pune, MH", moq: "MOQ 3,000", lead: "12 days", match: 98, tag: "Top match" },
      { name: "Noida Print Collective", location: "Noida, UP", moq: "MOQ 5,000", lead: "15 days", match: 94, tag: "Best price" },
      { name: "Surat Pouch Studio", location: "Surat, GJ", moq: "MOQ 2,500", lead: "18 days", match: 90, tag: "Fastest sample" },
    ],
  },
  {
    query: "Custom printed wrappers for chocolate bars, 10,000 units",
    results: [
      { name: "Ahmedabad Pack Studio", location: "Ahmedabad, GJ", moq: "MOQ 5,000", lead: "10 days", match: 97, tag: "Top match" },
      { name: "Mumbai Foil Works", location: "Mumbai, MH", moq: "MOQ 8,000", lead: "14 days", match: 92, tag: "Premium finish" },
      { name: "Chennai Carton Co.", location: "Chennai, TN", moq: "MOQ 10,000", lead: "16 days", match: 88, tag: "Best price" },
    ],
  },
  {
    query: "Glass dropper bottles, 30ml, 2,000 units for serum",
    results: [
      { name: "Firozabad Glass Works", location: "Firozabad, UP", moq: "MOQ 1,500", lead: "20 days", match: 96, tag: "Top match" },
      { name: "Mumbai Beauty Pack", location: "Mumbai, MH", moq: "MOQ 2,000", lead: "18 days", match: 91, tag: "Beauty specialist" },
      { name: "Delhi Cosmo Pack", location: "Delhi, DL", moq: "MOQ 2,500", lead: "22 days", match: 87, tag: "Fastest sample" },
    ],
  },
];

function useTypewriter(text: string, speed = 35, startDelay = 200) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setOut("");
    setDone(false);
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const start = setTimeout(function tick() {
      i++;
      setOut(text.slice(0, i));
      if (i < text.length) {
        t = setTimeout(tick, speed);
      } else {
        setDone(true);
      }
    }, startDelay);
    return () => {
      clearTimeout(start);
      clearTimeout(t!);
    };
  }, [text, speed, startDelay]);

  return { out, done };
}

export default function AISearchDemoSection() {
  const { ref, isVisible } = useScrollReveal(0.15);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "matching" | "shown">("typing");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenario = scenarios[idx];
  const { out, done } = useTypewriter(scenario.query, 32, 300);

  // Drive phases
  useEffect(() => {
    if (!isVisible) return;
    if (done && phase === "typing") {
      setPhase("matching");
      timerRef.current = setTimeout(() => setPhase("shown"), 900);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [done, phase, isVisible]);

  // Advance scenario
  useEffect(() => {
    if (phase !== "shown") return;
    const t = setTimeout(() => {
      setIdx((i) => (i + 1) % scenarios.length);
      setPhase("typing");
    }, 4200);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <section
      ref={ref}
      id="ai-demo"
      className="relative overflow-hidden py-14 md:py-20 bg-muted"
    >
      <div className="mx-auto max-w-content px-[5vw] md:px-8">
        <div className={`mx-auto max-w-2xl text-center ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[1.5px] text-primary">
            <Sparkles className="h-3.5 w-3.5 animate-ai-sparkle" />
            Live AI Demo
          </span>
          <h2 className="mt-4 font-heading text-[32px] font-semibold tracking-tight text-foreground md:text-[38px]">
            Describe what you need. Get matched in seconds.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Snaplogo's AI scans verified manufacturers and ranks the best fit by MOQ, price, lead time, and past projects.
          </p>
        </div>

        <div
          className={`mx-auto mt-10 max-w-3xl rounded-2xl border border-border bg-background p-4 sm:p-6 card-soft ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
          style={{ animationDelay: "120ms" }}
        >
          {/* Fake browser chrome */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-[1.2px] text-muted-foreground">snaplogo.in / discover</span>
          </div>

          {/* Search bar with typewriter */}
          <div className="flex h-14 items-center rounded-full border border-primary/40 bg-background p-1.5 shadow-[0_2px_16px_rgba(37,99,235,0.08)]">
            <Search className="ml-4 h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex h-full flex-1 items-center px-3 text-sm text-foreground">
              <span>{out}</span>
              <span className="ml-0.5 inline-block h-4 w-[2px] animate-cursor-blink bg-primary" />
            </div>
            <button
              type="button"
              aria-label="AI search"
              className="mr-1 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-[12px] font-bold uppercase tracking-wider text-primary-foreground"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Match</span>
            </button>
          </div>

          {/* Status line */}
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {phase === "typing" && <span>Listening…</span>}
              {phase === "matching" && (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary/60" />
                    <span className="relative h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <span>Scanning 1,000+ verified manufacturers…</span>
                </>
              )}
              {phase === "shown" && (
                <>
                  <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                  <span>3 best matches found</span>
                </>
              )}
            </div>
            <span className="hidden sm:inline">AI ranked by MOQ · price · lead time · past projects</span>
          </div>

          {/* Result cards */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {scenario.results.map((r, i) => {
              const visible = phase === "shown";
              return (
                <div
                  key={`${idx}-${i}`}
                  className={`group relative rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md ${
                    visible ? "animate-reveal-up" : "opacity-0 translate-y-2"
                  }`}
                  style={{ animationDelay: `${i * 120}ms`, animationFillMode: "both" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-heading text-[15px] font-semibold text-foreground">{r.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {r.location}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-primary">
                      {r.match}%
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 text-primary/70" />
                      {r.moq}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary/70" />
                      {r.lead}
                    </div>
                  </div>

                  <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-primary/20 bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary">
                    <Sparkles className="h-2.5 w-2.5" />
                    {r.tag}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className={`mt-4 text-center text-xs text-muted-foreground ${isVisible ? "animate-reveal-up" : "opacity-0"}`} style={{ animationDelay: "300ms" }}>
          Demo data shown. Real matches use your specs, designs, and past order history.
        </p>
      </div>
    </section>
  );
}
