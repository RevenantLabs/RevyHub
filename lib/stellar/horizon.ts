import { Horizon } from "@stellar/stellar-sdk";

export type StellarNetwork = "testnet" | "mainnet";

export const STELLAR_NETWORK: StellarNetwork =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet" ? "mainnet" : "testnet";

export const horizonUrls = {
  testnet:
    process.env.NEXT_PUBLIC_HORIZON_TESTNET_URL ?? "https://horizon-testnet.stellar.org",
  mainnet: process.env.NEXT_PUBLIC_HORIZON_MAINNET_URL ?? "https://horizon.stellar.org"
};

export const horizonServer = new Horizon.Server(horizonUrls[STELLAR_NETWORK]);

export function getHorizonServer(network: StellarNetwork = STELLAR_NETWORK) {
  return new Horizon.Server(horizonUrls[network]);
}

/** Maximum time (ms) to wait for a Horizon response before treating it as a timeout. */
export const HORIZON_TIMEOUT_MS = 10_000;

/**
 * Returns true when an error represents a user-initiated cancellation or a
 * component-unmount abort — i.e. something the user should never see as a
 * server error message.
 */
export function isCancelledError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") return true;
  if (error instanceof Error && error.name === "AbortError") return true;
  return false;
}

/**
 * Returns true when an error represents a request timeout.
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "TimeoutError") return true;
  if (error instanceof Error && error.name === "TimeoutError") return true;
  return false;
}

/**
 * Races `promise` against a timeout of `ms` milliseconds and an optional
 * external `signal`.  Rejects with a `DOMException("AbortError")` on
 * cancellation and a `DOMException("TimeoutError")` on timeout.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number = HORIZON_TIMEOUT_MS,
  signal?: AbortSignal
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    // Internal timeout controller
    const timeoutId = setTimeout(() => {
      reject(new DOMException("Horizon request timed out.", "TimeoutError"));
    }, ms);

    const cleanup = () => clearTimeout(timeoutId);

    // Honour an externally supplied cancellation signal
    if (signal) {
      if (signal.aborted) {
        cleanup();
        reject(new DOMException("Request was cancelled.", "AbortError"));
        return;
      }
      signal.addEventListener("abort", () => {
        cleanup();
        reject(new DOMException("Request was cancelled.", "AbortError"));
      }, { once: true });
    }

    promise.then(
      (value) => { cleanup(); resolve(value); },
      (error) => { cleanup(); reject(error); }
    );
  });
}
