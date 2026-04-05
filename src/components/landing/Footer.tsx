import layerLogo from "@/assets/layer-logo.png";

export default function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <img src={layerLogo} alt="Snapit" width={22} height={22} loading="lazy" />
          <span className="font-heading text-sm font-bold tracking-tight text-heading">Snapit</span>
        </div>
        <p className="text-xs text-body-muted">© {new Date().getFullYear()} Snapit. Packaging infrastructure for D2C brands.</p>
      </div>
    </footer>
  );
}
