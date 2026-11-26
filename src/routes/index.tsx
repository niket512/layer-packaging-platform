import { createFileRoute } from "@tanstack/react-router";
import AppHome from "@/pages/AppHome";
import SourcingAgent from "@/pages/SourcingAgent";
import { currentHost, isAppHostname } from "@/lib/request-host";
import { initialFormVariant } from "@/lib/form-variant";

// The marketplace is served on the app. subdomain; every other host gets the guided box form.
export const Route = createFileRoute("/")({
  loader: () => {
    const appHost = isAppHostname(currentHost());
    return { appHost, formVariant: appHost ? null : initialFormVariant() };
  },
  component: HomeRoute,
});

function HomeRoute() {
  const { appHost, formVariant } = Route.useLoaderData();
  return appHost ? <AppHome /> : <SourcingAgent requirementMode="form" initialFormVariant={formVariant ?? undefined} />;
}
