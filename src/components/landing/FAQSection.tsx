import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  { q: "What categories does Snaplogo cover?", a: "We're starting with flexible packaging (pouches, wrappers) for FMCG brands, with more categories coming soon." },
  { q: "What MOQs can I expect?", a: "Our manufacturer network is specifically selected to work with smaller quantities suited for emerging D2C brands." },
  { q: "How does pricing work?", a: "You receive a clear, itemised quote before committing to any order. No hidden charges or last-minute revisions." },
  { q: "How do you ensure quality?", a: "All manufacturers on our platform are onboarded through a verification process. We also manage sample approvals before production begins." },
  { q: "Is Snaplogo free to use?", a: "Getting started and discovering manufacturers is free. We'll share pricing details for managed services at sign-up." },
  { q: "How long does an order typically take?", a: "Timelines vary by product and quantity, but we'll share a clear production and delivery estimate before your order is confirmed." },
  { q: "Do you charge commissions?", a: "No. We charge no commission and maintain complete pricing transparency with the manufacturers." },
];

export default function FAQSection() {
  const { ref, isVisible } = useScrollReveal();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section ref={ref} id="faq" className="py-12 md:py-[88px] bg-background">
      <div className="mx-auto max-w-content px-5 md:px-6">
        <div className={`mx-auto max-w-2xl text-center ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="label-eyebrow">FAQs</p>
          <h2 className="mt-3 font-heading text-[26px] font-semibold leading-tight tracking-tight text-foreground md:text-[38px]">
            Common questions
          </h2>
        </div>

        <div className={`mx-auto mt-8 max-w-2xl md:mt-12 ${isVisible ? "animate-reveal-up" : "opacity-0"}`} style={{ animationDelay: "150ms" }}>
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-border">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between py-5 text-left"
              >
                <span className="pr-4 font-heading text-base font-semibold text-foreground">{faq.q}</span>
                {openIndex === i ? <Minus className="h-5 w-5 shrink-0 text-primary" /> : <Plus className="h-5 w-5 shrink-0 text-muted-foreground" />}
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? "max-h-40 pb-5" : "max-h-0"}`}>
                <p className="text-base leading-relaxed text-muted-foreground">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
