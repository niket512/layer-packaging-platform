import { createFileRoute } from "@tanstack/react-router";
import RequestPreview from "@/pages/RequestPreview";

export const Route = createFileRoute("/request")({
  component: RequestPreview,
});
