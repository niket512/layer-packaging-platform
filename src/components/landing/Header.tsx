import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import layerLogo from "@/assets/snaplogo-blue.png";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "How it works", href: "#how-it-works", id: "how-it-works" },
  { label: "Platform", href: "#what-you-can-order", id: "what-you-can-order" },
  { label: "FAQ", href: "#faq", id: "faq" },
];

const scrollToAccess = () => {
  document.getElementById("request-access")?.scrollIntoView({ behavior: "smooth" });
  window.dispatchEvent(new Event("open-access-form"));
};

const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeId = useScrollSpy(navLinks.map((l) => l.id));

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <img src={layerLogo} alt="Snaplogo" width={52} height={52} />
          <span className="font-heading text-xl font-bold tracking-tight text-heading">Snaplogo</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.id)}
              className={cn(
                "relative text-sm font-medium transition-colors duration-150 hover:text-heading",
                activeId === l.id ? "text-heading" : "text-body-muted",
              )}
            >
              {l.label}
              <span
                className={cn(
                  "absolute -bottom-1 left-0 h-0.5 rounded-full bg-primary transition-all duration-300",
                  activeId === l.id ? "w-full" : "w-0",
                )}
              />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" onClick={scrollToAccess}>
            Sign in
          </Button>
          <Button variant="hero" size="sm" onClick={scrollToAccess}>
            Register with us
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
                className={cn(
                  "text-sm font-medium",
                  activeId === l.id ? "text-primary" : "text-body-muted",
                )}
                onClick={(e) => {
                  handleNavClick(e, l.id);
                  setMobileOpen(false);
                }}
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
              Register with us
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
