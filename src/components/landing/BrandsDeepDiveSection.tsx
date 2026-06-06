import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, LayoutDashboard, Sparkles, ShieldCheck, FileText, Truck, MessageSquare, CreditCard } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Smart Discovery",
    tagline: "Find the right manufacturer in minutes, not weeks.",
    accordions: [
      {
        icon: Sparkles,
        q: "AI-powered matching",
        a: "Upload your spec, design, or formulation. Snap AI scans 1,000+ verified manufacturers and surfaces the best fit by MOQ, price, lead time, and past projects.",
      },
      {
        icon: ShieldCheck,
        q: "Every manufacturer verified",
        a: "GST-checked, capacity-audited, sample-reviewed. No fly-by-night brokers — only partners who've delivered for real brands.",
      },
      {
        icon: FileText,
        q: "Quotes you can compare",
        a: "Side-by-side quotes with apples-to-apples pricing — material, MOQ, lead time, sample cost. No hidden markups, no broker commissions.",
      },
    ],
  },
  {
    icon: LayoutDashboard,
    title: "Order 360",
    tagline: "From PO to doorstep — managed in one dashboard.",
    accordions: [
      {
        icon: MessageSquare,
        q: "Sample & approval workflow",
        a: "Coordinate sample requests, sign-offs, and revisions in one clean thread — not across WhatsApp, email, and phone calls.",
      },
      {
        icon: Truck,
        q: "Live production & shipment tracking",
        a: "Real-time status from production floor to your warehouse. Know exactly where your order is at every stage.",
      },
      {
        icon: CreditCard,
        q: "Payments & milestones",
        a: "Tracked advance, balance, and milestone payments. Clear records, GST-compliant invoices, zero chasing.",
      },
    ],
  },
];

export default function BrandsDeepDiveSection() {
  const { ref, isVisible } = useScrollReveal(0.1);
  return (
    <section ref={ref} id="for-brands" className="bg-muted py-14 md:py-20">
      <div className="mx-auto max-w-content px-[5vw] md:px-8">
        <div className={`mx-auto max-w-2xl text-center ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="label-eyebrow">For Brands & Retailers</p>
          <h2 className="mt-3 font-heading text-[32px] font-semibold tracking-tight text-foreground md:text-[38px]">
            Source faster. Manage smarter. Ship on time.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Two pillars built for D2C and retail brands — AI discovery up front, end-to-end order management after.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`flex h-full flex-col rounded-2xl border border-border bg-card p-7 card-soft transition-all hover:-translate-y-1 hover:border-primary/40 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
              style={{ animationDelay: `${120 + i * 120}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.6)]">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground">{f.title}</h3>
              </div>
              <p className="mt-3 text-base text-muted-foreground">{f.tagline}</p>

              <Accordion type="single" collapsible className="mt-5 w-full">
                {f.accordions.map((a, j) => (
                  <AccordionItem key={a.q} value={`${i}-${j}`} className="border-border">
                    <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline">
                      <span className="flex items-center gap-2.5">
                        <a.icon className="h-4 w-4 text-primary" />
                        {a.q}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pl-[26px] text-sm leading-relaxed text-muted-foreground">
                      {a.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
