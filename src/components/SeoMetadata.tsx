import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPublishedManufacturers } from "@/data/directory";

const BASE_URL = "https://snaplogo.in";
const pages: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Snaplogo | Packaging Sourcing for D2C Brands",
    description: "Find packaging manufacturers for your D2C brand. Share your box or pouch requirements and receive quotations from vetted manufacturers within 24 hours on WhatsApp.",
  },
  "/sourcing": {
    title: "Start a Packaging Sourcing Request | Snaplogo",
    description: "Describe your packaging type, quantity and budget, upload reference designs and send your brief to Snaplogo's sourcing team for manufacturer matching and quotations.",
  },
  "/landing": {
    title: "D2C Packaging Procurement Platform | Snaplogo",
    description: "Explore Snaplogo's packaging discovery and procurement services for brands and manufacturers, with direct quotations and zero commission.",
  },
  "/manufacturers": {
    title: "Find Packaging Manufacturers in India | Snaplogo",
    description: "Share your packaging requirement, pick manufacturers and WhatsApp them directly.",
  },
  "/app": {
    title: "Manufacturer Product Catalogues | Snaplogo",
    description: "Browse approved manufacturer catalogues and search packaging products by category, material, dimensions and supplier.",
  },
  "/proposal": {
    title: "Packaging Manufacturer Matching Proposal | Snaplogo",
    description: "Review Snaplogo's packaging sourcing process, manufacturer matching and commercial terms: zero commission, confidentiality and no exclusivity.",
  },
  "/team": {
    title: "Snaplogo Sourcing Team | Packaging Support",
    description: "Meet your packaging sourcing partner. Snaplogo's team reviews requirements, shortlists vetted manufacturers and helps brands obtain quotations.",
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
    title: `${manufacturer.name} — Packaging Manufacturer | Snaplogo`,
    description: manufacturer.description,
  } : pages[route];
  const title = page?.title ?? (slug ? "Manufacturer Not Found | Snaplogo" : "Snaplogo | Account and Workspace");
  const description = page?.description ?? "Manage your Snaplogo account and packaging workspace.";
  const canonical = `${BASE_URL}${route}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={page ? "index, follow" : "noindex, follow"} />
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