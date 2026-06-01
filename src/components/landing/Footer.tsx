export default function Footer() {
  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="mx-auto max-w-content px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-heading text-base font-bold tracking-tight text-foreground">Snaplogo</p>
            <p className="mt-1 text-sm text-muted-foreground">Procurement infrastructure for D2C brands</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="/privacy-policy" className="transition-colors hover:text-foreground">Privacy</a>
            <a href="mailto:contact@snapit.club" className="transition-colors hover:text-foreground">Contact</a>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Snaplogo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
