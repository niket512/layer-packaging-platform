import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What are the minimum order quantities on Layer?",
    a: "Layer pools demand across brands and works with manufacturers who support flexible MOQs. Depending on the order and packaging type, minimums can start as low as 200 units.",
  },
  {
    q: "How does Layer ensure quality?",
    a: "Every manufacturer on Layer goes through a verification process. Production orders include structured QC checkpoints, and you approve samples before any bulk run begins.",
  },
  {
    q: "What packaging categories does Layer support?",
    a: "Layer currently supports corrugated boxes, mailer boxes, rigid boxes, pouches, labels, and flexible packaging. We're expanding categories every quarter.",
  },
  {
    q: "How are manufacturers selected?",
    a: "Layer matches your spec against verified manufacturers based on capability, capacity, material access, and past performance. You review options and select your preferred partner.",
  },
  {
    q: "What's the typical timeline from spec to delivery?",
    a: "Sampling usually takes 7–12 days. Production timelines vary by packaging type but typically range from 15–25 days after sample approval. Layer tracks every milestone centrally.",
  },
  {
    q: "Can I reorder the same packaging later?",
    a: "Yes. Layer saves your approved specs, sample records, and manufacturer preferences. Reordering is a one-click workflow with no repeated briefing.",
  },
];

export default function FAQSection() {
  const { ref, isVisible } = useScrollReveal();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section ref={ref} id="faq" className="py-24 md:py-32">
      <div className="container">
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">FAQ</p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-heading text-balance sm:text-4xl">
            Common questions
          </h2>
        </div>

        <div
          className={`mx-auto mt-14 max-w-2xl divide-y divide-border ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
          style={{ animationDelay: "200ms" }}
        >
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between py-5 text-left transition-colors"
              >
                <span className="pr-4 font-heading text-base font-semibold text-heading">{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-body-muted transition-transform duration-200 ${openIndex === i ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${openIndex === i ? "max-h-40 pb-5" : "max-h-0"}`}
              >
                <p className="text-sm leading-relaxed text-body">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
