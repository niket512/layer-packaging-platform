import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";

/** Hostname of the current request: read from the request on the server, from the address bar in the browser. */
export const currentHost = createIsomorphicFn()
  .server(() => getRequestHost())
  .client(() => window.location.hostname);

export const isAppHostname = (host: string) => host.startsWith("app.");
