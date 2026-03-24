import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { FileText, Users, ShieldCheck, Truck } from "lucide-react";

const steps = [
  {
    icon: FileText,
    num: "01",
    title: "Define your packaging spec",
    desc: "Describe your packaging need with text or upload a reference image. Layer structures your requirements into a production-ready brief.",
  },
  {
    icon: Users,
    num: "02",
    title: "Platform pools supply & capacity",
    desc: "Layer matches your spec against verified manufacturers with available capacity, material inventory, and relevant experience.",
  },
  {
    icon: ShieldCheck,
    num: "03",
    title: "Verified manufacturers execute",
    desc: "Selected manufacturers produce samples, iterate on feedback, and move to production — all coordinated through the platform.",
  },
  {
    icon: Truck,
    num: "04",
    title: "QC & delivery tracked centrally",
    desc: "Quality checkpoints, payment milestones, and shipment tracking live in one place. No more spreadsheet chasing.",
  },
];

export default function HowItWorksSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} id="how-it-works" className="py-16 md:py-20">
      <div className="container">
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">How it works</p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-heading text-balance sm:text-4xl">
            From spec to shipment in four steps
          </h2>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid gap-0 md:grid-cols-4">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className={`relative flex flex-col items-center text-center px-5 py-8 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
                style={{ animationDelay: `${200 + i * 100}ms` }}
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-[3.5rem] hidden h-px w-full bg-border md:block" style={{ left: "50%" }} />
                )}
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-subtle text-primary shadow-sm">
                  <s.icon className="h-6 w-6" />
                </div>
                <span className="mt-4 font-heading text-xs font-bold uppercase tracking-widest text-primary">{s.num}</span>
                <h3 className="mt-2 font-heading text-base font-semibold text-heading">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-body">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
