/**
 * Freighter is a browser extension, not an HTTP service: this slice reads
 * `window.freighterApi` and makes no network request, so there is nothing to
 * mock here.
 */
import type { RequestHandler } from "msw";

export const handlers: RequestHandler[] = [];
