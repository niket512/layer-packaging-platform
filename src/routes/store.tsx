import { createFileRoute } from "@tanstack/react-router";
import AppStore from "@/pages/AppStore";

export const Route = createFileRoute("/store")({
  component: AppStore,
});
