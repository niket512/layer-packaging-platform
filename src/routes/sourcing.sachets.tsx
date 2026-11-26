import { createFileRoute } from "@tanstack/react-router";
import SourcingAgent from "@/pages/SourcingAgent";

export const Route = createFileRoute("/sourcing/sachets")({
  component: () => <SourcingAgent category="sachets" requirementMode="form" />,
});
