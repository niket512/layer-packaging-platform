import { createFileRoute } from "@tanstack/react-router";
import ManufacturerNetworkPage from "@/pages/ManufacturerNetwork";

export const Route = createFileRoute("/manufacturer-network")({
  component: ManufacturerNetworkPage,
});
