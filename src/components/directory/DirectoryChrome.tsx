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

export function DirectoryFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-10 md:flex-row md:items-start md:justify-between md:px-6">
        <div>
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="h-6 w-6" />
            <span className="font-heading font-bold text-foreground">Snaplogo</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">© {new Date().getFullYear()} Snaplogo</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {nav.map((n) => (
            <a key={n.label} href={n.href} className="hover:text-foreground">{n.label}</a>
          ))}
          <a href="mailto:contact@snapit.club" className="hover:text-foreground">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
