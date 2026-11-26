import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/gramiyaa")({
  beforeLoad: () => {
    throw redirect({ to: "/bottles", replace: true });
  },
});
