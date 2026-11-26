import { createFileRoute } from "@tanstack/react-router";
import SourcingAgent from "@/pages/SourcingAgent";

export const Route = createFileRoute("/sourcing/cosmetic-packaging")({
  component: () => <SourcingAgent category="cosmetic-packaging" />,
});
