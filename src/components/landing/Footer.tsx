export default function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
        <span className="font-heading text-sm font-bold tracking-tight text-heading">Layer</span>
        <p className="text-xs text-body-muted">© {new Date().getFullYear()} Layer. Packaging infrastructure for D2C brands.</p>
      </div>
    </footer>
  );
}
