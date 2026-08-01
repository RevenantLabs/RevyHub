import { getResponseStatus } from "@/lib/stellar/account";

/**
 * HTTP status codes from Horizon that indicate a temporary server-side problem.
 * 404 and 400-range validation failures are intentionally excluded — those are
 * permanent for the current input and should never surface a Retry action.
 */
const TRANSIENT_HTTP_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

/**
 * Returns true when the error is likely caused by a transient condition such as
 * a rate-limit, timeout, or temporary Horizon unavailability. Validation errors,
 * 404 not-found responses, and unknown non-HTTP errors return false.
 */
export function isTransientError(error: unknown): boolean {
  const status = getResponseStatus(error);

  if (status !== undefined) {
    return TRANSIENT_HTTP_STATUSES.has(status);
  }

  // Network-level failures (no HTTP response) — fetch throws TypeError for
  // failed requests and DOMException for aborted ones.
  if (error instanceof TypeError || error instanceof DOMException) {
    return true;
  }

  // Horizon SDK wraps network timeouts in plain Error objects whose messages
  // contain recognisable keywords.
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes("timeout") || msg.includes("network") || msg.includes("econnreset");
  }

  return false;
}
