import type { HttpHandler } from "msw";

/**
 * Offline feature slice — makes zero network requests.
 */
export const handlers: HttpHandler[] = [];
