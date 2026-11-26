import { createFileRoute } from "@tanstack/react-router";
import AppAdmin from "@/pages/AppAdmin";

export const Route = createFileRoute("/admin/")({
  component: AppAdmin,
});
