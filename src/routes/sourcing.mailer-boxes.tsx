import { createFileRoute } from "@tanstack/react-router";
import SourcingAgent from "@/pages/SourcingAgent";

export const Route = createFileRoute("/sourcing/mailer-boxes")({
  component: () => <SourcingAgent category="mailer-boxes" requirementMode="form" />,
});
