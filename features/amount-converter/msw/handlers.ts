/**
 * The amount converter is fully offline: it performs no network request at
 * all, so this slice intentionally registers no handlers. The file exists to
 * keep the slice layout uniform and to make the "no requests" claim explicit.
 */
import type { RequestHandler } from "msw";

export const handlers: RequestHandler[] = [];
