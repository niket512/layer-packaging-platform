import { Link, useParams } from "@/lib/router-compat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import articles from "@/data/packaging-articles.json";
import { BOX_DESIGNS } from "@/components/sourcing/packaging-catalogue";
import logo from "@/assets/snaplogo-orange.png";
import NotFound from "./NotFound";

const PUBLISHED = "2026-11-06";

const sectionId = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function PackagingGuides() {
  const { slug } = useParams();
  const article = articles.find(item => item.slug === slug);
  if (slug && !article) return <NotFound />;
  const sections = article?.body.match(/^## .+$/gm)?.map(line => line.slice(3)) ?? [];
  const schema = article ? [
    { "@context": "https://schema.org", "@type": "Article", headline: article.heading, description: article.description, mainEntityOfPage: `https://snaplogo.in/blog/${article.slug}`, image: new URL(BOX_DESIGNS[0]?.image ?? "/og-image.png", "https://snaplogo.in").href, datePublished: PUBLISHED, author: { "@type": "Organization", name: "Snaplogo", url: "https://snaplogo.in/about" }, publisher: { "@type": "Organization", name: "Snaplogo", url: "https://snaplogo.in" } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://snaplogo.in/" },
      { "@type": "ListItem", position: 2, name: "Packaging guides", item: "https://snaplogo.in/blog" },
      { "@type": "ListItem", position: 3, name: article.heading, item: `https://snaplogo.in/blog/${article.slug}` },
    ] },
  ] : null;
  return <div className="theme-sourcing min-h-screen bg-background text-foreground">
    {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />}
    <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
      <nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-content items-center gap-3 px-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2 font-bold"><img src={logo} alt="" className="h-7 w-7" />snaplogo<span className="text-primary">.</span></Link>
        <Button asChild variant="ghost" size="sm" className="ml-auto"><Link to="/designs">Designs</Link></Button>
        <Button asChild size="sm" className="rounded-full"><Link to="/">Request quotes<ArrowRight /></Link></Button>
      </nav>
    </header>
    <main className="mx-auto max-w-content px-4 py-8 sm:px-8 sm:py-12">
      {article ? <>
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap gap-2 text-xs text-muted-foreground"><Link to="/">Home</Link><span aria-hidden>/</span><Link to="/blog">Packaging guides</Link><span aria-hidden>/</span><span>Buyer guide</span></nav>
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase text-primary">Snaplogo · Packaging buyer guide</p>
          <p className="mt-1 text-xs text-muted-foreground">Published <time dateTime={PUBLISHED}>6 November 2026</time></p>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{article.heading}</h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{article.description}</p>
        </div>
        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
          <article className="min-w-0 max-w-3xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
              h2: ({ children }) => <h2 id={sectionId(String(children))} className="mb-4 mt-10 scroll-mt-24 text-2xl font-semibold leading-snug">{children}</h2>,
              h3: ({ children }) => <h3 className="mb-3 mt-7 text-lg font-semibold leading-snug">{children}</h3>,
              p: ({ children }) => <p className="mb-4 text-base leading-7">{children}</p>,
              ul: ({ children }) => <ul className="mb-5 list-disc space-y-2 pl-6 text-base leading-7 marker:text-primary">{children}</ul>,
              ol: ({ children }) => <ol className="mb-5 list-decimal space-y-2 pl-6 text-base leading-7">{children}</ol>,
              table: ({ children }) => <div role="region" aria-label="Packaging comparison table" tabIndex={0} className="my-6 overflow-x-auto rounded-lg border border-border focus-visible:outline-primary"><table className="w-full min-w-[540px] border-collapse text-left text-sm leading-relaxed">{children}</table></div>,
              th: ({ children }) => <th scope="col" className="border-b border-border bg-muted px-4 py-3 font-semibold">{children}</th>,
              td: ({ children }) => <td className="border-b border-border px-4 py-3 align-top">{children}</td>,
              a: ({ href, children }) => href?.startsWith("/") ? <Link to={href} className="font-medium text-primary underline underline-offset-4">{children}</Link> : <a href={href} className="font-medium text-primary underline underline-offset-4" rel="noopener noreferrer">{children}</a>,
            }}>{article.body}</ReactMarkdown>
            <section className="mt-10 border-t border-border pt-6" aria-labelledby="design-references">
              <h2 id="design-references" className="text-xl font-semibold">Explore packaging references</h2>
              <div className="mt-4 grid grid-cols-2 gap-4">{BOX_DESIGNS.slice(0, 2).map(design => <figure key={design.id}><img src={design.image} alt={design.name} width={512} height={512} loading="lazy" className="aspect-square w-full rounded-lg border border-border bg-card object-contain" /><figcaption className="mt-2 text-xs leading-relaxed text-muted-foreground">{design.name} · Illustrative reference, not a manufacturer specification.</figcaption></figure>)}</div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm"><Link to="/designs" className="font-semibold text-primary underline underline-offset-4">Browse corrugated box designs</Link><Link to="/designs/flexible-pouches" className="font-semibold text-primary underline underline-offset-4">Explore flexible pouch designs</Link></div>
            </section>
            <section className="mt-10 border-t border-border py-8"><h2 className="text-2xl font-semibold">Ready to compare packaging quotes?</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Share your size, quantity and printing needs. Leave unknown specifications open for manufacturer guidance.</p><Button asChild className="mt-5 rounded-full"><Link to="/">Submit your packaging requirement<ArrowRight /></Link></Button></section>
          </article>
          <aside className="lg:sticky lg:top-24">
            <nav aria-label="Article contents" className="border-l border-border pl-5"><h2 className="text-sm font-semibold">In this guide</h2><ul className="mt-4 space-y-3">{sections.map(title => <li key={title}><a href={`#${sectionId(title)}`} className="text-sm leading-relaxed text-muted-foreground hover:text-primary">{title}</a></li>)}</ul></nav>
          </aside>
        </div>
        <section className="mt-10 border-t border-border pt-8"><h2 className="text-2xl font-semibold">Related packaging guides</h2><div className="mt-5 grid gap-4 sm:grid-cols-3">{articles.filter(item => item.slug !== slug).map(item => <Link key={item.slug} to={`/blog/${item.slug}`} className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary"><h3 className="text-base font-semibold leading-snug">{item.title}</h3><span className="mt-4 inline-flex items-center gap-2 text-sm text-primary">Read guide<ArrowRight className="h-4 w-4" /></span></Link>)}</div></section>
      </> : <>
        <h1 className="text-3xl font-bold sm:text-4xl">Packaging guides for D2C brands</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">Find manufacturers, compare quotes and prepare a clearer packaging brief.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">{articles.map(item => <Link key={item.slug} to={`/blog/${item.slug}`} className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary"><h2 className="text-xl font-semibold leading-snug">{item.title}</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">Read guide<ArrowRight className="h-4 w-4" /></span></Link>)}</div>
      </>}
    </main>
    <footer className="border-t border-border"><nav aria-label="Footer" className="mx-auto flex max-w-content flex-wrap gap-5 px-4 py-6 text-sm text-muted-foreground sm:px-8"><Link to="/blog" className="inline-flex items-center gap-2"><ArrowLeft className="h-4 w-4" />All guides</Link><Link to="/about">About Snaplogo</Link><Link to="/designs">Packaging designs</Link><Link to="/privacy-policy">Privacy policy</Link></nav></footer>
  </div>;
}