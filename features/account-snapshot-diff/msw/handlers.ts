/**
 * The snapshot viewer compares two pasted documents in-process and never calls
 * Horizon, so this slice registers no handlers. That is the point of the tool:
 * a pair of snapshots stays useful even when the endpoint they came from is
 * unavailable, or the network is gone entirely.
 */
import type { RequestHandler } from "msw";

export const handlers: RequestHandler[] = [];
