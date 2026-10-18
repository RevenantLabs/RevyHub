import type { FederationErrorCode } from "@/features/federation-resolver/types";

export const DEFAULT_TIMEOUT_MS = 8_000;

export class FederationTimeoutError extends Error {
  constructor() {
    super("Federation lookup timed out");
    this.name = "FederationTimeoutError";
  }
}

export class FederationNetworkError extends Error {
  readonly cause: unknown;

  constructor(cause: unknown) {
    super("Federation network error");
    this.name = "FederationNetworkError";
    this.cause = cause;
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : (error as Error | undefined)?.name === "AbortError";
}

/** A cancelled or timed-out lookup is reported separately from a dead server. */
export function toFederationErrorCode(error: unknown): FederationErrorCode {
  if (error instanceof FederationTimeoutError || isAbortError(error)) return "timeout";
  return "network_error";
}

export function createTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (typeof AbortSignal === "undefined") return undefined;
  if (typeof AbortSignal.timeout === "function") return AbortSignal.timeout(timeoutMs);

  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

export function combineSignals(
  userSignal: AbortSignal | undefined,
  timeoutSignal: AbortSignal | undefined
): AbortSignal | undefined {
  if (!userSignal) return timeoutSignal;
  if (!timeoutSignal) return userSignal;
  if (typeof AbortSignal.any === "function") return AbortSignal.any([userSignal, timeoutSignal]);

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  userSignal.addEventListener("abort", onAbort, { once: true });
  timeoutSignal.addEventListener("abort", onAbort, { once: true });
  if (userSignal.aborted || timeoutSignal.aborted) controller.abort();
  return controller.signal;
}
