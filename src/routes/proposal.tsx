import { createFileRoute } from "@tanstack/react-router";
import Proposal from "@/pages/Proposal";

export const Route = createFileRoute("/proposal")({
  component: Proposal,
});
