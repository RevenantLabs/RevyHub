/**
 * The asset descriptor codec operates entirely offline in-process without network requests.
 * An empty array is exported to fulfill the layout contract.
 */
import type { RequestHandler } from "msw";

export const handlers: RequestHandler[] = [];
