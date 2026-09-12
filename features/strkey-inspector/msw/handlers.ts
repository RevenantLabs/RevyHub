import type { RequestHandler } from "msw";

/**
 * StrKey inspector operates fully offline and performs no network requests.
 */
export const handlers: RequestHandler[] = [];
