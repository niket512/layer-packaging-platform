import { createFileRoute } from "@tanstack/react-router";
import SourcingAgent from "@/pages/SourcingAgent";

export const Route = createFileRoute("/sourcing/corrugated-boxes")({
  component: () => <SourcingAgent category="corrugated-boxes" requirementMode="form" />,
});
