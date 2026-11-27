import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";

// Marketplace home is only for the app. subdomain; keep it out of the box-form bundle.
const AppHome = lazy(() => import("@/pages/AppHome"));
import SourcingAgent from "@/pages/SourcingAgent";
import { currentHost, isAppHostname } from "@/lib/request-host";
import { initialFormVariant } from "@/lib/form-variant";
import { seoHead } from "@/lib/seo-metadata";

// The marketplace is served on the app. subdomain; every other host gets the guided box form.
export const Route = createFileRoute("/")({
  head: ({ loaderData }) => seoHead("/", Boolean(loaderData?.appHost)),
  loader: () => {
    const appHost = isAppHostname(currentHost());
    return { appHost, formVariant: appHost ? null : initialFormVariant() };
  },
  component: HomeRoute,
});

function HomeRoute() {
  const { appHost, formVariant } = Route.useLoaderData();
  return appHost ? <Suspense fallback={null}><AppHome /></Suspense> : <SourcingAgent requirementMode="form" initialFormVariant={formVariant ?? undefined} />;
}
