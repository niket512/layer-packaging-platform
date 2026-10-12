import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, MapPin, MessageCircle, Phone } from "lucide-react";
import { DirectoryFooter, DirectoryHeader } from "@/components/directory/DirectoryChrome";
import { CAPABILITIES, CUSTOMIZATION, categoryLabel, enquiryHref, fetchPublishedManufacturers, placeOf, waDigits, whatsappHref } from "@/data/directory";

export default function ManufacturerProfile() {
  const { slug } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ["directory"], queryFn: fetchPublishedManufacturers });
  const m = data?.find((x) => x.slug === slug);

  useEffect(() => { if (m) document.title = `${m.name} – packaging manufacturer | Snaplogo`; }, [m]);

  return (
    <div className="min-h-screen bg-background">
      <DirectoryHeader />
      <main className="mx-auto max-w-[1000px] px-4 py-10 md:px-6">
        <Link to="/manufacturers#discover" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> All manufacturers</Link>
        {isLoading ? (
          <div className="mt-8 h-64 animate-pulse rounded-2xl bg-muted" />
        ) : !m ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
            <h1 className="font-heading text-xl font-semibold">Manufacturer not found</h1>
            <Link to="/manufacturers" className="mt-4 inline-block text-sm text-primary hover:underline">Back to directory</Link>
          </div>
        ) : (
          <article className="mt-6">
            {m.cover_image_url && <img src={m.cover_image_url} alt="" width={944} height={704} className="aspect-[21/8] w-full rounded-2xl object-cover" />}
            <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">{m.name}</h1>
                {placeOf(m) && <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{placeOf(m)}</p>}
                {m.phone && (
                  <a href={`tel:${waDigits(m.phone)}`} className="mt-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    <Phone className="h-4 w-4" />{m.phone}
                  </a>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={enquiryHref(m.name)} className="rounded-full bg-primary px-5 py-3 text-xs font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90">Request a Quote</a>
                {m.phone && (
                  <a href={whatsappHref(m.name, m.phone)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-5 py-3 text-xs font-bold uppercase tracking-wide text-[#053d21] hover:brightness-95">
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                )}
                {m.website_url && <a href={m.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full border border-border px-5 py-3 text-xs font-bold uppercase tracking-wide">Website <ExternalLink className="h-3 w-3" /></a>}
              </div>
            </div>
            <p className="mt-5 max-w-[720px] leading-relaxed text-muted-foreground">{m.description}</p>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <Block title="Packaging categories" items={m.packaging_categories.map(categoryLabel)} />
              <Block title="Products" items={m.products} />
              <Block title="Customisation" items={m.customization_capabilities.map((c) => CUSTOMIZATION[c])} />
              <Block title="Manufacturing & printing" items={m.printing_capabilities.map((c) => CAPABILITIES[c])} />
              <Block title="Minimum order" items={m.minimum_order_quantities.map((f) => `${f.value} — ${f.scope}`)} empty="Not yet confirmed" />
              <Block title="Lead times" items={m.lead_times.map((f) => `${f.value} — ${f.scope}`)} empty="Not yet confirmed" />
              <Block title="Delivery coverage" items={m.delivery_locations ?? []} empty="Not yet confirmed" />
            </div>
            <p className="mt-6 text-xs text-muted-foreground">Details based on the supplier’s published information · Last updated {m.last_updated_at}</p>
          </article>
        )}
      </main>
      <DirectoryFooter />
    </div>
  );
}

function Block({ title, items, empty }: { title: string; items: string[]; empty?: string }) {
  if (items.length === 0 && !empty) return null;
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[1.5px] text-muted-foreground">{title}</h2>
      {items.length ? (
        <ul className="mt-3 space-y-1.5 text-sm text-foreground">{items.map((i) => <li key={i}>{i}</li>)}</ul>
      ) : <p className="mt-3 text-sm text-muted-foreground">{empty}</p>}
    </section>
  );
}
