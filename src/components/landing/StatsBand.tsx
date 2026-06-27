import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const stats = [
  { value: "500+", label: "Verified manufacturers" },
  { value: "21 days", label: "Avg. sample-to-PO" },
  { value: "₹2 Cr+", label: "Orders coordinated" },
  { value: "98%", label: "On-time delivery" },
];

export default function StatsBand() {
  const { ref, isVisible } = useScrollReveal(0.1);
  return (
    <section ref={ref} className="relative overflow-hidden bg-foreground py-14 md:py-20">
      {/* Subtle orange glow */}
      <div className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 50%, hsl(24 95% 53% / 0.18), transparent 45%), radial-gradient(circle at 85% 50%, hsl(24 95% 53% / 0.12), transparent 45%)",
        }}
      />
      <div className="relative mx-auto max-w-content px-5 md:px-8">
        <div className={`grid items-end gap-10 md:grid-cols-[1fr_auto] ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[1.8px] text-primary">
              Built for India's D2C ecosystem
            </p>
            <h2 className="mt-3 font-heading text-[28px] font-bold leading-[1.05] tracking-tight text-background sm:text-[38px] md:text-[48px]">
              A coordinated AI workforce<br className="hidden md:block" />
              <span className="text-primary"> for every order, every brand.</span>
            </h2>
          </div>
        </div>

        <div className="relative mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 md:mt-14 md:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`bg-foreground p-6 md:p-8 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="font-heading text-[32px] font-bold tracking-tight text-background md:text-[44px]">
                {s.value}
              </div>
              <div className="mt-1 text-[12px] font-semibold uppercase tracking-[1.2px] text-background/60 md:text-[13px]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
