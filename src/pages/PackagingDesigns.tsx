import { useEffect } from "react";
import { ArrowRight, Box, Layers, MessageCircle } from "lucide-react";

type Design = { name: string; code?: string; desc: string; bestFor: string };

const CORRUGATED: Design[] = [
  { name: "Regular Slotted Carton (RSC)", code: "FEFCO 0201", desc: "The standard shipping box — four flaps top and bottom, taped shut. Most economical style per unit.", bestFor: "General shipping, most SKUs" },
  { name: "Half Slotted Carton (HSC)", code: "FEFCO 0200", desc: "RSC without top flaps — open-top box, usually paired with a separate lid.", bestFor: "Storage bins, lid-and-base sets" },
  { name: "Full Overlap Slotted Carton", code: "FEFCO 0203", desc: "Outer flaps fully overlap for extra stacking strength and puncture resistance.", bestFor: "Heavy or fragile products" },
  { name: "Mailer Box", code: "FEFCO 0427", desc: "The e-commerce standard — rolled side walls, ear locks, no glue or tape needed. Premium unboxing feel.", bestFor: "D2C shipping, subscription boxes" },
  { name: "Flat Mailer", code: "FEFCO 0427 variant", desc: "Low and wide mailer for flat goods.", bestFor: "Clothing, prints, books" },
  { name: "Telescopic Box", code: "FEFCO 0300 series", desc: "Separate lid and base that fit over each other — height adjustable, very rigid.", bestFor: "Gift boxes, electronics, export" },
  { name: "Die-Cut Box", code: "FEFCO 0400 series", desc: "Custom shape cut with a die — self-locking, no tape, any footprint.", bestFor: "Custom retail and food packaging" },
  { name: "Auto-Lock Bottom Box", code: "FEFCO 0713", desc: "Pre-glued bottom snaps open in one motion — fastest assembly on packing lines.", bestFor: "High-volume packing operations" },
  { name: "Five-Panel Wrap", code: "FEFCO 0401", desc: "One blank wraps around the product — long panel shows continuous print.", bestFor: "Long or flat products" },
  { name: "Partition / Divider Box", code: "FEFCO 0900 interiors", desc: "Inner dividers create cells that keep items from touching.", bestFor: "Bottles, jars, glassware" },
  { name: "Heavy-Duty Export Box", code: "5-ply / 7-ply", desc: "Double or triple wall board for long transit, stacking and rough handling.", bestFor: "Export, industrial parts" },
  { name: "Pizza & Food Box", code: "Die-cut, food-grade", desc: "Grease-resistant food-grade board with venting options.", bestFor: "Food delivery and QSR" },
  { name: "Shelf-Ready / Retail Display Box", code: "FEFCO 0600 series", desc: "Ships closed, tears open into a counter or shelf display.", bestFor: "Retail launches, promotions" },
];

const FLEXIBLE: Design[] = [
  { name: "Stand-Up Pouch", code: "Doypack", desc: "Bottom gusset lets the pouch stand on shelf. Available with zipper, window and matte/gloss finishes.", bestFor: "Snacks, coffee, dry fruits, pet food" },
  { name: "Flat / Three-Side Seal Pouch", code: "3SS", desc: "Sealed on three sides, open on one for filling. Simple and low cost.", bestFor: "Sachets, single-serve, samples" },
  { name: "Four-Side Seal Pouch", code: "4SS", desc: "Sealed on all four sides — crisp uniform look, no back seam.", bestFor: "Premium single-serve, pharma" },
  { name: "Pillow Pouch", code: "Back-seal", desc: "Fin or lap seal down the back — the classic chips and candy format from form-fill-seal lines.", bestFor: "Snacks, confectionery, powders" },
  { name: "Spout Pouch", code: "Fitment pouch", desc: "Stand-up pouch with a welded spout and cap — reclosable liquid packaging.", bestFor: "Juices, oils, purees, baby food" },
  { name: "Side Gusset Pouch", code: "Gusseted", desc: "Gussets on both sides expand for higher volume while keeping a slim front face.", bestFor: "Coffee, tea, bulk dry goods" },
  { name: "Flat-Bottom / Quad-Seal Pouch", code: "Box pouch", desc: "Four corner seals and a flat base — stands like a box, five printable panels.", bestFor: "Premium coffee, pet food" },
  { name: "Stick Pack", code: "Slim sachet", desc: "Narrow single-dose tube — portion-controlled and travel-friendly.", bestFor: "Instant coffee, sugar, supplements" },
  { name: "Shaped / Die-Cut Pouch", code: "Custom contour", desc: "Pouch cut to a custom silhouette for standout shelf presence.", bestFor: "Kids' products, promotions" },
  { name: "Vacuum Pouch", code: "High-barrier", desc: "Air-evacuated multilayer pouch that extends shelf life.", bestFor: "Meat, cheese, nuts, spices" },
  { name: "Retort Pouch", code: "PET/AL/NY/PE", desc: "Withstands 121°C sterilisation — a flexible alternative to cans.", bestFor: "Ready-to-eat meals, curries" },
  { name: "Roll Stock", code: "Printed film", desc: "Printed laminated film on rolls for your own form-fill-seal machines.", bestFor: "Brands with in-house packing lines" },
  { name: "Zipper / Reclosable Pouch", code: "Press-to-close or slider", desc: "Resealable closure keeps contents fresh after opening.", bestFor: "Multi-serve snacks, staples" },
];

function DesignCard({ d }: { d: Design }) {
  return (
    <article className="flex flex-col rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug">{d.name}</h3>
        {d.code && (
          <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{d.code}</span>
        )}
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{d.desc}</p>
      <p className="mt-auto pt-2 text-[11px] text-primary">Best for: {d.bestFor}</p>
    </article>
  );
}

export default function PackagingDesigns() {
  useEffect(() => {
    document.title = "Packaging designs — corrugated boxes & flexible pouches | Snaplogo";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", "Every corrugated box and flexible pouch design you can get made in India — pick a design and message manufacturers directly.");
  }, []);

  return (
    <div className="theme-directory min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-[1000px] px-4 pb-16 md:px-6">
        <header className="flex items-center justify-between border-b border-border py-4">
          <a href="/manufacturers" className="text-lg font-bold">snaplogo<span className="text-primary">.</span></a>
          <a href="/manufacturers" className="text-xs text-muted-foreground hover:text-foreground">← Find manufacturers</a>
        </header>

        <section className="pb-8 pt-8 md:pt-10">
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">Every packaging design, in one place.</h1>
          <p className="mt-2 max-w-[560px] text-sm text-muted-foreground">
            The standard corrugated box and flexible pouch designs Indian manufacturers can make — with industry codes
            so you can ask for exactly what you need. Pick a design, then message makers directly.
          </p>
        </section>

        <section aria-labelledby="corr-h">
          <div className="flex items-center gap-2">
            <Box className="h-5 w-5 text-primary" />
            <h2 id="corr-h" className="text-xl font-semibold">Corrugated box designs</h2>
            <span className="text-xs text-muted-foreground">{CORRUGATED.length} styles · FEFCO codes</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CORRUGATED.map((d) => <DesignCard key={d.name} d={d} />)}
          </div>
          <a
            href="/manufacturers?category=corrugated"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Find corrugated box manufacturers <ArrowRight className="h-4 w-4" />
          </a>
        </section>

        <section aria-labelledby="flex-h" className="mt-12">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h2 id="flex-h" className="text-xl font-semibold">Flexible pouch designs</h2>
            <span className="text-xs text-muted-foreground">{FLEXIBLE.length} formats</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FLEXIBLE.map((d) => <DesignCard key={d.name} d={d} />)}
          </div>
          <a
            href="/manufacturers?category=flexible"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Find flexible pouch manufacturers <ArrowRight className="h-4 w-4" />
          </a>
        </section>

        <section className="mt-12 rounded-2xl border border-border bg-card p-6 text-center">
          <h2 className="text-lg font-semibold">Not sure which design fits your product?</h2>
          <p className="mx-auto mt-1 max-w-[420px] text-sm text-muted-foreground">
            Describe your product in our WhatsApp community and we'll point you to the right design and makers.
          </p>
          <a
            href="https://chat.whatsapp.com/I0vypMLz6bEKIeViw8rwh6"
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-cta mt-4 inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold"
          >
            <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
          </a>
        </section>
      </main>
    </div>
  );
}
