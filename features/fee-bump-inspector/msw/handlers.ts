/**
 * The fee-bump inspector decodes and hashes entirely in-process and makes no
 * network request, so this slice registers no handlers. The file exists to
 * keep the layout uniform and to make the "nothing is transmitted" claim
 * explicit: a test that saw a request here would have nothing to answer it.
 */
import type { RequestHandler } from "msw";

export const handlers: RequestHandler[] = [];
