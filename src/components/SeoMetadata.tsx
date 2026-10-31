import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPublishedManufacturers } from "@/data/directory";

const BASE_URL = "https://snaplogo.in";
const SITE_TITLE = "Corrugated Box, Sachet & Stand-Up Pouch Manufacturers | Snaplogo";
const SITE_DESCRIPTION = "Source corrugated boxes, sachets and stand-up pouches from vetted manufacturers. Share your preferred city, such as Ahmedabad, and get quotes within 24 hours.";
const pages: Record<string, { title: string; description: string; noindex?: boolean }> = {
  "/": {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  "/sourcing": {
    title: `Sourcing Request | ${SITE_TITLE}`,
    description: SITE_DESCRIPTION,
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