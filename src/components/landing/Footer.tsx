import layerLogo from "@/assets/snaplogo-blue.png";

export default function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="container flex flex-col gap-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <img src={layerLogo} alt="Snaplogo" width={36} height={36} loading="lazy" />
            <span className="font-heading text-sm font-bold tracking-tight text-heading">Snaplogo</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-body-muted">
            <a href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="mailto:contact@snapit.club" className="hover:text-foreground transition-colors">contact@snapit.club</a>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs text-body-muted">© {new Date().getFullYear()} Snaplogo. The Sourcing OS for D2C brands.</p>
        </div>
      </div>
    </footer>
  );
}