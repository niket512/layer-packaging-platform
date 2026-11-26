import { createFileRoute } from "@tanstack/react-router";
import SourcingAgent from "@/pages/SourcingAgent";

export const Route = createFileRoute("/sourcing/flexible-pouches")({
  component: () => <SourcingAgent category="flexible-pouches" requirementMode="form" />,
});
