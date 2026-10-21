import type { RequestHandler } from "msw";

/**
 * The locator is fully offline. It never calls Horizon or RPC, so there is nothing to mock.
 */
export const handlers: RequestHandler[] = [];
