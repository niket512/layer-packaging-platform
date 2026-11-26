import { createFileRoute } from "@tanstack/react-router";
import Designs from "@/pages/Designs";

export const Route = createFileRoute("/designs/")({
  component: Designs,
});
