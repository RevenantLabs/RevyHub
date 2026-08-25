import { setupServer } from "msw/node";
import type { RequestHandler } from "msw";
import { afterAll, afterEach, beforeAll } from "vitest";

/**
 * Installs an MSW server for the current test file and wires the standard
 * lifecycle hooks.
 *
 * ```ts
 * const server = withMswHandlers(...handlers);
 * server.use(http.get("...", () => HttpResponse.error()));
 * ```
 */
export function withMswHandlers(...handlers: RequestHandler[]): ReturnType<typeof setupServer> {
  const server = setupServer(...handlers);

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  return server;
}

export { http, HttpResponse, delay } from "msw";
