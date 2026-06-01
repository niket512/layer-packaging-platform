import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "How It Works", id: "how-it-works" },
  { label: "What We Offer", id: "what-we-offer" },
];

const scrollToAccess = () => {
  document.getElementById("sign-up")?.scrollIntoView({ behavior: "smooth" });
  window.dispatchEvent(new Event("open-access-form"));
};

const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-background transition-all duration-200",
        scrolled ? "border-b border-border" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
        <a href="#" className="font-heading text-lg font-bold tracking-tight text-foreground">
          Snaplogo
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={(e) => handleNavClick(e, l.id)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#sign-up"
            onClick={(e) => { e.preventDefault(); scrollToAccess(); }}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Sign Up
          </a>
        </nav>

        <div className="hidden md:block">
          <Button variant="hero" size="pill" onClick={scrollToAccess}>
            Sign Up
          </Button>
        </div>

        <button
          className="p-2 md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-6 pb-6 pt-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                className="text-sm font-medium text-muted-foreground"
                onClick={(e) => { handleNavClick(e, l.id); setMobileOpen(false); }}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <Button variant="hero" size="pill" className="mt-4 w-full" onClick={() => { scrollToAccess(); setMobileOpen(false); }}>
            Sign Up
          </Button>
        </div>
      )}
    </header>
  );
}
