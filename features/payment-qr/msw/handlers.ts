/**
 * The payment QR generator is fully offline: the URI is assembled locally and
 * the QR is rendered locally, so no request handler is needed.
 */
import type { RequestHandler } from "msw";

export const handlers: RequestHandler[] = [];
