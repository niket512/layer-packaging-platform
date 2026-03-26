import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import layerLogo from "@/assets/layer-logo.png";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Platform film", href: "#platform-film" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "FAQ", href: "#faq" },
];

const scrollToAccess = () => {
  document.getElementById("request-access")?.scrollIntoView({ behavior: "smooth" });
  window.dispatchEvent(new Event("open-access-form"));
};

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <a href="#" className="font-heading text-xl font-bold tracking-tight text-heading">
          Layer
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-body-muted transition-colors duration-150 hover:text-heading"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" onClick={scrollToAccess}>
            Sign in
          </Button>
          <Button variant="hero" size="sm" onClick={scrollToAccess}>
            Request access
          </Button>
        </div>

        <button
          className="p-2 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/40 bg-background px-6 pb-6 pt-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-body-muted"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="ghost" size="sm" onClick={() => { scrollToAccess(); setMobileOpen(false); }}>
              Sign in
            </Button>
            <Button variant="hero" size="sm" onClick={() => { scrollToAccess(); setMobileOpen(false); }}>
              Request access
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
