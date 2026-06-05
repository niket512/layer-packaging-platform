import logo from "@/assets/snaplogo-orange.png";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-content flex-col items-center gap-3 px-5 py-5 text-center md:h-16 md:flex-row md:flex-wrap md:justify-between md:gap-3 md:py-0 md:px-8 md:text-left">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Snaplogo" className="h-5 w-5 object-contain" />
          <span className="font-heading text-sm font-bold tracking-tight text-foreground">Snaplogo</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Snaplogo · Built for India's D2C ecosystem
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <a href="/privacy-policy" className="transition-colors hover:text-primary">Privacy Policy</a>
          <span>·</span>
          <a href="mailto:contact@snapit.club" className="transition-colors hover:text-primary">Contact</a>
        </div>
      </div>
    </footer>
  );
}
