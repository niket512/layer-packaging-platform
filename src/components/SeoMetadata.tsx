import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPublishedManufacturers } from "@/data/directory";
import articles from "@/data/packaging-articles.json";

const BASE_URL = "https://snaplogo.in";
const SITE_TITLE = "Snaplogo — Vetted Packaging Manufacturers, Quotes in 4 Hours";
const SITE_DESCRIPTION = "Get quotes from 100+ vetted Indian manufacturers for corrugated boxes, sachets and stand-up pouches. Share your requirement — quotes from multiple manufacturers within 4 hours.";
const pages: Record<string, { title: string; description: string; noindex?: boolean }> = {
  "/admin/chats": { title: "Private Chats | Snaplogo", description: "Private sourcing conversation inbox for Snaplogo administrators.", noindex: true },
  "/app/admin/chats": { title: "Private Chats | Snaplogo", description: "Private sourcing conversation inbox for Snaplogo administrators.", noindex: true },
  "/blog": {
    title: "Packaging Guides for D2C Brands | Snaplogo",
    description: "Practical packaging guides for D2C brands: find manufacturers, understand corrugated box pricing, prepare RFQs and compare shipping boxes with mailer boxes.",
  },
  ...Object.fromEntries(articles.map(article => [`/blog/${article.slug}`, { title: `${article.title} | Snaplogo`, description: article.description }])),
  "/": {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  "/sourcing": {
    title: `Sourcing Request | ${SITE_TITLE}`,
    description: SITE_DESCRIPTION,
  },
  "/sourcing/corrugated-boxes": {
    title: "Corrugated Box Manufacturers — Quotes in 4 Hours | Snaplogo",
    description: "Get matched with vetted corrugated box manufacturers for your required box size, board grade, printing and order quantity. Quotes within 4 hours.",
  },
  "/sourcing/flexible-pouches": {
    title: "Flexible Pouch Manufacturers — Quotes in 4 Hours | Snaplogo",
    description: "Source custom printed stand-up pouches, zipper pouches and other flexible packaging formats from vetted manufacturers. Quotes within 4 hours.",
  },
  "/sourcing/sachets": {
    title: "Sachet & Stick Pack Manufacturers — Quotes in 4 Hours | Snaplogo",
    description: "Source custom printed sachets, stick packs and single-serve flexible packaging from vetted manufacturers. Quotes within 4 hours.",
  },
  "/sourcing/cosmetic-packaging": {
    title: "Cosmetic Packaging Manufacturers — Quotes in 4 Hours | Snaplogo",
    description: "Source bottles, jars, tubes and boxes for skincare and beauty products from vetted manufacturers. Quotes within 4 hours.",
  },
  "/sourcing/mailer-boxes": {
    title: "Mailer Box Manufacturers — Quotes in 4 Hours | Snaplogo",
    description: "Get matched with vetted manufacturers for custom printed mailer and e-commerce shipping boxes. Quotes within 4 hours.",
  },
  "/sourcing/thank-you": {
    title: `Request Received | ${SITE_TITLE}`,
    description: SITE_DESCRIPTION,
    noindex: true,
  },
  "/about": {
    title: `About | ${SITE_TITLE}`,
    description: SITE_DESCRIPTION,
  },
  "/manufacturers": {
    title: `Directory | ${SITE_TITLE}`,
    description: SITE_DESCRIPTION,
  },
  "/manufacturer-network": {
    title: `Manufacturer Network | ${SITE_TITLE}`,
    description: "Explore packaging businesses across India by company, city and state, with product capabilities and transparent listing sources.",
  },
  "/app": {
    title: `Catalogues | ${SITE_TITLE}`,
    description: SITE_DESCRIPTION,
  },
  "/proposal": {
    title: `Proposal | ${SITE_TITLE}`,
    description: SITE_DESCRIPTION,
  },
  "/team": {
    title: `Team | ${SITE_TITLE}`,
    description: SITE_DESCRIPTION,
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
  const directoryHost = host.startsWith("manufacturers.") || host.startsWith("makers.");
  const route = pathname === "/" && directoryHost ? "/manufacturers" : pathname === "/" && host.startsWith("app.") ? "/app" : pathname;
  const slug = pathname.match(/^\/manufacturers\/([^/]+)\/?$/)?.[1];
  const { data } = useQuery({ queryKey: ["directory"], queryFn: fetchPublishedManufacturers, enabled: !!slug });
  const manufacturer = data?.find((item) => item.slug === slug);
  const page = manufacturer ? {
    title: `${manufacturer.name} | ${SITE_TITLE}`,
    description: SITE_DESCRIPTION,
  } : pages[route];
  const title = page?.title ?? `${slug ? "Manufacturer Not Found" : "Account and Workspace"} | ${SITE_TITLE}`;
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