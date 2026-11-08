export default function TrustStory() {
  return (
    <section aria-label="Brands" className="mx-auto mt-5 w-full max-w-[1120px] border-y border-border py-3 text-left sm:mt-6 sm:py-4">
      <div>
        <div className="grid grid-cols-3 items-center gap-x-3 gap-y-3 pb-2 sm:grid-cols-6 sm:gap-x-5">{["Dastaan", "Bloom Naturals", "Kaapi Co.", "Urban Roots", "Masala Tales", "Pure Sip"].map(b => <span key={b} className="min-w-0 text-center text-sm font-bold leading-snug text-foreground sm:text-base">{b}</span>)}</div>
      </div>
    </section>
  );
}
