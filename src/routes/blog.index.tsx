import { createFileRoute } from "@tanstack/react-router";
import PackagingGuides from "@/pages/PackagingGuides";

export const Route = createFileRoute("/blog/")({
  component: PackagingGuides,
});
