import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router";

/** Renders a component inside a real router at the given path, replacing react-router's MemoryRouter in tests. */
export async function renderWithRouter(ui: ReactNode, path = "/") {
  const rootRoute = createRootRoute({ component: () => <>{ui}</> });
  const router = createRouter({ routeTree: rootRoute, history: createMemoryHistory({ initialEntries: [path] }) });
  await router.load();
  return render(<RouterProvider router={router} />);
}
