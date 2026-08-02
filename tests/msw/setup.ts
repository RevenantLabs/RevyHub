import { beforeAll, afterEach, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/**
 * MSW server pre-configured with default Horizon / Friendbot handlers.
 *
 * - `server.listen()` is called once before all tests via a vitest setupFile.
 * - `server.resetHandlers()` runs after each test to clear per-test overrides.
 * - `server.close()` is called once after all tests.
 *
 * Configured to **fail on unhandled requests** — any request that does not
 * match a registered handler will throw, ensuring no accidental live calls.
 */
export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

