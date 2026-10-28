import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import kraftShip from "@/assets/design-ship-kraft.jpg";
import whiteMailer from "@/assets/design-mailer-white.jpg";
import printedKraft from "@/assets/design-printed-kraft.jpg";
import tealMailer from "@/assets/design-mailer-teal.jpg";
import blackMailer from "@/assets/design-mailer-black.jpg";
import dieCut from "@/assets/design-diecut-open.jpg";

type Design = { id: string; name: string; detail: string; tab: "shipping" | "mailers" | "printed"; image: string; prefill: string };

const DESIGNS: Design[] = [
  { id: "kraft-ship", name: "Plain kraft shipping box", detail: "5-ply kraft, tape closure", tab: "shipping", image: kraftShip, prefill: "I need 2,000 plain kraft corrugated shipping boxes, 5-ply, 30×24×15 cm, no printing, for e-commerce dispatch" },
  { id: "die-cut", name: "Die-cut carry box", detail: "White-top liner, die-cut handle", tab: "shipping", image: dieCut, prefill: "I need 1,000 white-top corrugated die-cut boxes with carry handles, 5-ply, 25×20×10 cm, no printing" },
  { id: "logo-mailer", name: "White logo mailer", detail: "Single-colour logo print", tab: "mailers", image: whiteMailer, prefill: "I need 1,500 white corrugated mailer boxes, 3-ply, 20×16×6 cm, single-colour logo print" },
  { id: "pattern-mailer", name: "Printed mailer box", detail: "All-over pattern print", tab: "mailers", image: tealMailer, prefill: "I need 1,000 corrugated mailer boxes, 3-ply, 22×16×6 cm, all-over multicolour pattern print" },
  { id: "brand-shipper", name: "Full-colour shipper", detail: "Multicolour brand print", tab: "printed", image: printedKraft, prefill: "I need 3,000 kraft corrugated shipping boxes, 5-ply, 25×20×8 cm, full-colour brand print, monthly orders" },
  { id: "premium-mailer", name: "Premium black mailer", detail: "Matte finish, foil logo", tab: "printed", image: blackMailer, prefill: "I need 500 black corrugated mailer boxes, 3-ply, 24×18×6 cm, matte lamination with foil logo print" },
];

const TABS: { key: Design["tab"] | "all"; label: string }[] = [
  { key: "all", label: "All designs" },
  { key: "shipping", label: "Shipping boxes" },
  { key: "mailers", label: "Mailer boxes" },
  { key: "printed", label: "Printed designs" },
];

export function CorrugatedDesigns({ onUseDesign }: { onUseDesign: (prefill: string) => void }) {
  const [tab, setTab] = useState<"all" | Design["tab"]>("all");
  const shown = DESIGNS.filter(d => tab === "all" || d.tab === tab);
  return (
    <section aria-label="Browse corrugated box designs" className="mt-12 text-left">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Browse corrugated box designs</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tap a design to start your requirement with it — sizes, quantity and printing are just examples.</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Design categories">
        {TABS.map(t => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${tab === t.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {shown.map(d => (
          <button key={d.id} type="button" onClick={() => onUseDesign(d.prefill)}
            className="group overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-shadow hover:shadow-md">
            <div className="aspect-square overflow-hidden bg-muted">
              <img src={d.image} alt={d.name} loading="lazy" width={640} height={640} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
            </div>
            <div className="p-3">
              <p className="flex items-center gap-1 text-sm font-semibold text-foreground">{d.name}<ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" /></p>
              <p className="mt-0.5 text-xs text-muted-foreground">{d.detail}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
