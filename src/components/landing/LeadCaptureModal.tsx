import { useState } from "react";
import { useLeadCapture } from "@/hooks/use-lead-capture";
import { Button } from "@/components/ui/button";
import { X, CheckCircle2 } from "lucide-react";

export default function LeadCaptureModal() {
  const { isOpen, closeCapture, isSubmitted, setSubmitted } = useLeadCapture();
  const [email, setEmail] = useState("");
  const [brand, setBrand] = useState("");

  if (!isOpen && !isSubmitted) return null;

  // Confirmation toast-like overlay
  if (isSubmitted && !isOpen) {
    return null; // We show inline confirmation below
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted();
    setEmail("");
    setBrand("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={closeCapture} />

      <div className="relative w-full max-w-md animate-reveal-scale rounded-2xl border border-border bg-surface-raised p-8 shadow-2xl">
        <button
          onClick={closeCapture}
          className="absolute right-4 top-4 rounded-lg p-1 text-body-muted transition-colors hover:bg-muted hover:text-heading"
        >
          <X className="h-5 w-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <h3 className="mt-4 font-heading text-xl font-bold text-heading">We'll be in touch</h3>
            <p className="mt-2 text-sm text-body">
              Thanks for your interest. Our team will contact you shortly.
            </p>
            <Button variant="ghost" className="mt-6" onClick={closeCapture}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <h3 className="font-heading text-xl font-bold text-heading">Get started with Snaplogo</h3>
            <p className="mt-2 text-sm text-body">
              Share your details and we'll reach out to set up your account.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-heading">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-heading outline-none transition-shadow focus:ring-2 focus:ring-ring/40 placeholder:text-body-muted"
                  placeholder="you@brand.com"
                />
              </div>
              <div>
                <label htmlFor="brand" className="mb-1.5 block text-sm font-medium text-heading">
                  Brand name
                </label>
                <input
                  id="brand"
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-heading outline-none transition-shadow focus:ring-2 focus:ring-ring/40 placeholder:text-body-muted"
                  placeholder="Your brand"
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full">
                Request access
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
