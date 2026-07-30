/**
 * MSW test server — initialized once for the entire test suite.
 *
 * Unexpected network requests are treated as hard errors so tests cannot
 * silently pass while making real network calls.
 */

import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll } from "vitest";
import { defaultHandlers } from "./handlers";

export const server = setupServer(...defaultHandlers);

beforeAll(() => {
  server.listen({
    // Any request that doesn't match a handler will throw, keeping the suite
    // fully offline and making gaps in handler coverage visible immediately.
    onUnhandledRequest: "error"
  });
});

afterEach(() => {
  // Remove per-test overrides registered with server.use() so they don't
  // bleed into the next test.
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
