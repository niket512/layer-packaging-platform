import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Bell, Workflow, ArrowRight, ShieldCheck, Filter, Target, Users, FileCheck, BarChart3 } from "lucide-react";

const openForm = () => {
  document.getElementById("sign-up")?.scrollIntoView({ behavior: "smooth" });
  window.dispatchEvent(new CustomEvent("open-access-form"));
};

const features = [
  {
    icon: Bell,
    title: "Lead Engine",
    tagline: "Only verified, ready-to-act brands — no spam, no tyre-kickers.",
    accordions: [
      {
        icon: ShieldCheck,
        q: "Every lead is verified",
        a: "Brand GST, SKUs live in market, decision-maker contact, and intent confirmed before a lead reaches you. No more wasted intro calls.",
      },
      {
        icon: Filter,
        q: "Smart filtering by your capabilities",
        a: "You only see briefs that match your MOQ, materials, machines, and turnaround. Skip the noise that doesn't fit your line.",
      },
      {
        icon: Target,
        q: "Match score on every brief",
        a: "Snap AI scores each brief against your past projects so you can prioritise the highest-fit opportunities first.",
      },
    ],
  },
  {
    icon: Workflow,
    title: "Manufacturer OS",
    tagline: "Run every client conversation, sample, and order from one place.",
    accordions: [
      {
        icon: Users,
        q: "All clients in one dashboard",
        a: "Active briefs, samples in flight, production schedules, dispatched orders — every client and order in a single view.",
      },
      {
        icon: FileCheck,
        q: "Samples, approvals, POs handled",
        a: "Capture sample feedback, lock approvals, raise POs, and track milestone payments without switching tools.",
      },
      {
        icon: BarChart3,
        q: "Capacity & revenue insights",
        a: "See line utilisation, pipeline value, and repeat-order share so you can plan ahead and grow with the right brands.",
      },
    ],
  },
];

export default function ManufacturersDeepDiveSection() {
  const { ref, isVisible } = useScrollReveal(0.1);
  return (
    <section ref={ref} id="for-manufacturers" className="bg-background py-14 md:py-20">
      <div className="mx-auto max-w-content px-[5vw] md:px-8">
        <div className={`mx-auto max-w-2xl text-center ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="label-eyebrow">For Manufacturers</p>
          <h2 className="mt-3 font-heading text-[32px] font-semibold tracking-tight text-foreground md:text-[38px]">
            Better leads. Less chasing. More orders.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Two pillars built for contract manufacturers — a clean lead pipeline up top, a complete operating system below.
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
                    <AccordionContent className="pl-6.5 text-sm leading-relaxed text-muted-foreground">
                      {a.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <button
                type="button"
                onClick={openForm}
                className="mt-6 inline-flex h-11 w-fit items-center gap-2 rounded-full bg-primary px-5 text-[13px] font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-[#1D4ED8]"
              >
                Sign Up <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
