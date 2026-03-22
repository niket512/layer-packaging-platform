import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Button } from "@/components/ui/button";
import { useLeadCapture } from "@/hooks/use-lead-capture";

export default function CTASection() {
  const { ref, isVisible } = useScrollReveal();
  const { openCapture } = useLeadCapture();

  return (
    <section ref={ref} className="bg-muted/40 py-24 md:py-32">
      <div className="container">
        <div
          className={`mx-auto max-w-2xl rounded-3xl border border-border bg-surface-raised p-10 text-center shadow-lg shadow-primary/5 md:p-16 ${isVisible ? "animate-reveal-scale" : "opacity-0"}`}
        >
          <h2 className="font-heading text-3xl font-bold tracking-tight text-heading text-balance sm:text-4xl">
            Ready to run packaging differently?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-body text-pretty">
            Share your email and brand name. We'll reach out shortly to get you started on Layer.
          </p>
          <Button
            variant="hero"
            size="xl"
            className="mt-8"
            onClick={openCapture}
          >
            Request access
          </Button>
        </div>
      </div>
    </section>
  );
}
