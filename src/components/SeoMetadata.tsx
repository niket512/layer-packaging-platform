import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import articles from "@/data/packaging-articles.json";

const BASE_URL = "https://snaplogo.in";
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
    title: "Custom Box Manufacturers in Mumbai & India — Quotes in 6 Hours | Snaplogo",
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

export default function SeoMetadata() {
  const { pathname } = useLocation();
  const host = window.location.hostname;
  const route = pathname === "/" && host.startsWith("app.") ? "/app" : pathname;
  const page = pages[route];
  const title = page?.title ?? `Account and Workspace | ${SITE_TITLE}`;
  const description = page?.description ?? SITE_DESCRIPTION;
  const canonical = `${BASE_URL}${route}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={page && !page.noindex ? "index, follow" : "noindex, follow"} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}