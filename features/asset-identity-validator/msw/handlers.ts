/**
 * This tool is fully offline. It never calls Horizon or Soroban RPC, so the
 * request-mock list stays empty on purpose.
 */
import type { RequestHandler } from "msw";

export const handlers: RequestHandler[] = [];
