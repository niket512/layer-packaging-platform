import articles from "@/data/packaging-articles.json";

/** Central public-route metadata, rendered into the server HTML head by the root route. */
export const BASE_URL = "https://snaplogo.in";
const SITE_TITLE = "Snaplogo — Vetted Packaging Manufacturers, Quotes in 6 Hours";
const SITE_DESCRIPTION = "Get quotes from 40+ vetted Indian manufacturers for corrugated boxes, sachets and stand-up pouches. Share your requirement — quotes from multiple manufacturers within 6 hours.";
const pages: Record<string, { title: string; description: string; noindex?: boolean }> = {
  "/request-form": { title: `Chat Request | ${SITE_TITLE}`, description: SITE_DESCRIPTION, noindex: true },
  "/request": { title: "Chat Preview | Snaplogo", description: "Internal packaging chat UI preview with simulated manufacturer matching.", noindex: true },
  "/admin/chats": { title: "Private Chats | Snaplogo", description: "Private sourcing conversation inbox for Snaplogo administrators.", noindex: true },
  "/app/admin/chats": { title: "Private Chats | Snaplogo", description: "Private sourcing conversation inbox for Snaplogo administrators.", noindex: true },
  "/blog": {
    title: "Packaging Guides for D2C Brands | Snaplogo",
    description: "Practical packaging guides for D2C brands: find manufacturers, understand corrugated box pricing, prepare RFQs and compare shipping boxes with mailer boxes.",
  },
  ...Object.fromEntries(articles.map(article => [`/blog/${article.slug}`, { title: `${article.title} | Snaplogo`, description: article.description }])),
  "/": {
    title: "Custom Box Manufacturers in Mumbai & Bangalore — Quotes in 6 Hours | Snaplogo",
    description: "Get custom box quotes from 40+ vetted manufacturers — corrugated, mailer, product and rigid boxes. Compare multiple quotes on WhatsApp within 6 hours, no commission.",
  },
  "/sourcing": {
    title: `Sourcing Request | ${SITE_TITLE}`,
    description: "Tell Snaplogo what packaging you need — boxes, pouches or sachets — and receive quotations from vetted Indian manufacturers.",
  },
  "/sourcing/corrugated-boxes": {
    title: "Corrugated Box Manufacturers — Quotes in 6 Hours | Snaplogo",
    description: "Get matched with vetted corrugated box manufacturers for your required box size, board grade, printing and order quantity. Quotes within 6 hours.",
  },
  "/sourcing/flexible-pouches": {
    title: "Flexible Pouch Manufacturers — Quotes in 6 Hours | Snaplogo",
    description: "Source custom printed stand-up pouches, zipper pouches and other flexible packaging formats from vetted manufacturers. Quotes within 6 hours.",
  },
  "/sourcing/sachets": {
    title: "Sachet & Stick Pack Manufacturers — Quotes in 6 Hours | Snaplogo",
    description: "Source custom printed sachets, stick packs and single-serve flexible packaging from vetted manufacturers. Quotes within 6 hours.",
  },
  "/sourcing/cosmetic-packaging": {
    title: "Cosmetic Packaging Manufacturers — Quotes in 6 Hours | Snaplogo",
    description: "Source bottles, jars, tubes and boxes for skincare and beauty products from vetted manufacturers. Quotes within 6 hours.",
  },
  "/sourcing/mailer-boxes": {
    title: "Mailer Box Manufacturers — Quotes in 6 Hours | Snaplogo",
    description: "Get matched with vetted manufacturers for custom printed mailer and e-commerce shipping boxes. Quotes within 6 hours.",
  },
  "/sourcing/thank-you": {
    title: `Request Received | ${SITE_TITLE}`,
    description: SITE_DESCRIPTION,
    noindex: true,
  },
  "/about": {
    title: `About | ${SITE_TITLE}`,
    description: "About Snaplogo: a packaging sourcing platform connecting Indian D2C brands with contract packaging manufacturers.",
  },
  "/manufacturer-network": {
    title: `Manufacturer Network | ${SITE_TITLE}`,
    description: "Explore packaging businesses across India by company, city and state, with product capabilities and transparent listing sources.",
  },
  "/app": {
    title: `Catalogues | ${SITE_TITLE}`,
    description: "Browse packaging manufacturer catalogues on Snaplogo and find products for your brand.",
  },
  "/proposal": {
    title: `Proposal | ${SITE_TITLE}`,
    description: "Snaplogo proposal: how brands and packaging manufacturers work together through Smart Discovery, Order 360, Lead Engine and Manufacturer OS.",
  },
  "/team": {
    title: `Team | ${SITE_TITLE}`,
    description: "Meet the team building Snaplogo, the packaging sourcing platform for Indian D2C brands and manufacturers.",
  },
  "/privacy-policy": {
    title: `Privacy Policy | ${SITE_TITLE}`,
    description: "How Snaplogo collects, uses and protects the information you share when sourcing packaging manufacturers.",
  },
  "/designs": {
    title: `Packaging Design Gallery | ${SITE_TITLE}`,
    description: "Browse corrugated box and flexible pouch design references and start a sourcing request with the design you like.",
  },
  "/designs/flexible-pouches": {
    title: `Flexible Pouch Designs | ${SITE_TITLE}`,
    description: "Browse flexible pouch, stand-up pouch and sachet design references. Choose a design and request custom packaging quotations through Snaplogo.",
  },
};

export type SeoEntry = { route: string; title: string; description: string; canonical: string; indexable: boolean };

export function seoFor(pathname: string, appHost = false): SeoEntry {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const route = clean === "/" && appHost ? "/app" : clean;
  const page = pages[route];
  return {
    route,
    title: page?.title ?? `Account and Workspace | ${SITE_TITLE}`,
    description: page?.description ?? SITE_DESCRIPTION,
    canonical: `${BASE_URL}${route}`,
    indexable: Boolean(page && !page.noindex),
  };
}

export function seoHead(pathname: string, appHost = false) {
  const seo = seoFor(pathname, appHost);
  return {
    meta: [
      { title: seo.title },
      { name: "description", content: seo.description },
      { name: "robots", content: seo.indexable ? "index, follow" : "noindex, follow" },
      { property: "og:title", content: seo.title },
      { property: "og:description", content: seo.description },
      { property: "og:url", content: seo.canonical },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `${BASE_URL}/og-image.png` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: seo.title },
      { name: "twitter:description", content: seo.description },
      { name: "twitter:image", content: `${BASE_URL}/og-image.png` },
    ],
    links: [{ rel: "canonical", href: seo.canonical }],
  };
}
