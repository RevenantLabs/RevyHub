/**
 * Convenience re-exports of scenario override helpers.
 *
 * Use these with `server.use()` inside individual tests to temporarily
 * replace a default handler with a scenario-specific one.
 *
 * @example
 * import { server } from "../msw/setup";
 * import { simulateNotFound } from "../msw/test-utils";
 *
 * it("handles a 404", () => {
 *   server.use(simulateNotFound());
 *   // ... test logic
 * });
 */
export {
  simulateDelay,
  simulateTimeout,
  simulateMalformedJson,
  simulateRateLimit,
  simulateNotFound,
  simulateServerError,
  simulateTrustlineExists,
  simulateFriendbotError
} from "./handlers";

export { handlers } from "./handlers";
