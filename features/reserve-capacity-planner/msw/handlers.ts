import type { RequestHandler } from "msw";

/** Offline planner: no Horizon or RPC calls are made, so no handlers are installed. */
export const handlers: RequestHandler[] = [];
