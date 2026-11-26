import { createFileRoute } from "@tanstack/react-router";
import SourcingAgent from "@/pages/SourcingAgent";

export const Route = createFileRoute("/sourcing/")({
  component: () => <SourcingAgent />,
});
