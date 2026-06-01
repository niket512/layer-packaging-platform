import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/assets/snaplogo-blue.png";

const scrollToAccess = () => {
  document.getElementById("sign-up")?.scrollIntoView({ behavior: "smooth" });
  window.dispatchEvent(new Event("open-access-form"));
};

export default function Header() {
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
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-[5vw] md:px-8">
        <a href="#" className="flex items-center gap-2">
          <img src={logo} alt="Snaplogo" className="h-7 w-7 object-contain" />
          <span className="font-heading text-lg font-bold tracking-tight text-foreground">
            Snaplogo
          </span>
        </a>

        <div className="flex items-center gap-3 md:gap-5">
          <button
            onClick={scrollToAccess}
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            Sign In
          </button>
          <Button variant="hero" size="pill" onClick={scrollToAccess}>
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}
