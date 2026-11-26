import { useState, useEffect } from "react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/assets/snaplogo-orange.png";

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
      <div className="mx-auto flex h-14 max-w-content items-center justify-between px-5 md:h-16 md:px-8">
        <a href="#" className="flex items-center gap-2">
          <img src={logo} alt="Snaplogo" className="h-6 w-6 object-contain md:h-7 md:w-7" />
          <span className="font-heading text-base font-bold tracking-tight text-foreground md:text-lg">
            Snaplogo
          </span>
        </a>

        <div className="flex items-center gap-2 md:gap-5">
          <Link
            to="/signin"
            className="hidden text-sm font-medium text-foreground transition-colors hover:text-primary sm:block"
          >
            Sign In
          </Link>
          <Button variant="hero" size="pill" onClick={scrollToAccess} className="h-10 px-4 text-[12px] md:h-12 md:px-6 md:text-[13px]">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}
