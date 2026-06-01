const links = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "What We Offer", href: "#what-we-offer" },
  { label: "FAQs", href: "#faq" },
  { label: "Contact", href: "mailto:contact@snapit.club" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="mx-auto max-w-content px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-heading text-base font-bold tracking-tight text-foreground">Snaplogo</p>
            <p className="mt-1 text-sm text-muted-foreground">Procurement infrastructure for D2C brands.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {links.map((l) => (
              <a key={l.label} href={l.href} className="transition-colors hover:text-primary">
                {l.label}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Snaplogo · Built for India's D2C ecosystem
        </div>
      </div>
    </footer>
  );
}
