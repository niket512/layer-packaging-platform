import { createFileRoute } from "@tanstack/react-router";
import SourcingThankYou from "@/pages/SourcingThankYou";

// The confirmation reads the just-saved enquiry from this browser, so it renders in the browser only.
export const Route = createFileRoute("/sourcing/thank-you")({
  ssr: false,
  component: SourcingThankYou,
});
