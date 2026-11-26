import { createFileRoute } from "@tanstack/react-router";
import AppHome from "@/pages/AppHome";

export const Route = createFileRoute("/app/")({
  component: AppHome,
});
