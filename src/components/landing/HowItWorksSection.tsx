import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { FileText, Users, ShieldCheck, Truck } from "lucide-react";
import journeyBg from "@/assets/journey-bg.jpg";

const steps = [
  {
    icon: FileText,
    num: "01",
    title: "Define your packaging spec",
    desc: "Describe your packaging need with text or upload a reference image. Snaplogo structures your requirements into a production-ready brief.",
  },
  {
    icon: Users,
    num: "02",
    title: "Platform pools supply & capacity",
    desc: "Snaplogo matches your spec against verified manufacturers with available capacity, material inventory, and relevant experience.",
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
    <section
      ref={ref}
      id="how-it-works"
      className="relative overflow-hidden py-20 md:py-28"
      style={{
        backgroundImage: `url(${journeyBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/85 via-background/75 to-background/90" />

      <div className="container relative">
        <div className={`mx-auto max-w-2xl text-center transition-all duration-700 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">How it works</p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-heading text-balance sm:text-4xl">
            Your sourcing journey, end to end
          </h2>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/40 to-primary/10 md:left-8" />

            <div className="space-y-10 md:space-y-14">
              {steps.map((s, i) => (
                <div
                  key={s.num}
                  className={`relative flex items-start gap-5 md:gap-7 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
                  style={{ animationDelay: `${200 + i * 120}ms` }}
                >
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-background shadow-md md:h-16 md:w-16">
                    <s.icon className="h-5 w-5 text-primary md:h-6 md:w-6" />
                  </div>
                  <div className="flex-1 rounded-2xl border border-border/60 bg-background/80 p-5 backdrop-blur-sm md:p-6">
                    <span className="font-heading text-xs font-bold uppercase tracking-widest text-primary">
                      Step {s.num}
                    </span>
                    <h3 className="mt-1 font-heading text-lg font-semibold text-heading md:text-xl">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-body md:text-base">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
