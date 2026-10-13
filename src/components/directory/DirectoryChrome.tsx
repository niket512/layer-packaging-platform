import { Link } from "react-router-dom";
import logo from "@/assets/snaplogo-orange.png";

const nav = [
  { label: "Discover Manufacturers", href: "/manufacturers#discover" },
  { label: "Packaging Categories", href: "/manufacturers#categories" },
  { label: "For Brands", href: "/" },
  { label: "For Manufacturers", href: "/app/store" },
];

export function DirectoryHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-4 md:px-6">
        <Link to="/manufacturers" className="flex items-center gap-2">
          <img src={logo} alt="" className="h-7 w-7" />
          <span className="font-heading font-bold text-foreground">Snaplogo</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
          {nav.map((n) => (
            <a key={n.label} href={n.href} className="hover:text-foreground">{n.label}</a>
          ))}
        </nav>
        <a href="/app/store" className="rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90">
          List Your Business
        </a>
      </div>
    </header>
  );
}
