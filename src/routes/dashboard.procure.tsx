import { createFileRoute } from "@tanstack/react-router";
import Procure from "@/pages/Procure";

export const Route = createFileRoute("/dashboard/procure")({
  component: Procure,
});
