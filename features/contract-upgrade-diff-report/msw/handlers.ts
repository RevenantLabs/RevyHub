/**
 * This tool is fully offline: both Wasm files are read and decoded in the
 * browser and nothing is transmitted. It registers no handlers on purpose, so
 * any request a test observed would be a regression, not a mocked success.
 */
import type { RequestHandler } from "msw";

export const handlers: RequestHandler[] = [];
