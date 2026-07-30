import { Horizon } from "@stellar/stellar-sdk";

export type StellarNetwork = "testnet" | "mainnet";

export const HORIZON_REQUEST_TIMEOUT_MS = 10_000;

export class HorizonRequestCancelledError extends Error {
  constructor() {
    super("Horizon request cancelled");
    this.name = "HorizonRequestCancelledError";
  }
}

export class HorizonRequestTimeoutError extends Error {
  constructor() {
    super("Horizon request timed out");
    this.name = "HorizonRequestTimeoutError";
  }
}

export function isCancelledError(error: unknown) {
  return (
    error instanceof HorizonRequestCancelledError ||
    (error instanceof DOMException && error.name === "AbortError")
  );
}

export function isTimeoutError(error: unknown) {
  return error instanceof HorizonRequestTimeoutError;
}

export interface HorizonRequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

export function runHorizonRequest<T>(
  request: PromiseLike<T>,
  options: HorizonRequestOptions = {}
): Promise<T> {
  const { signal, timeoutMs = HORIZON_REQUEST_TIMEOUT_MS } = options;

  if (signal?.aborted) {
    return Promise.reject(new HorizonRequestCancelledError());
  }

  return new Promise<T>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener("abort", handleAbort);
    };

    const settle = (callback: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback();
    };

    const handleAbort = () => {
      settle(() => reject(new HorizonRequestCancelledError()));
    };

    signal?.addEventListener("abort", handleAbort, { once: true });
    const timeoutId = setTimeout(() => {
      settle(() => reject(new HorizonRequestTimeoutError()));
    }, timeoutMs);

    Promise.resolve(request).then(
      (value) => settle(() => resolve(value)),
      (error) => settle(() => reject(error))
    );
  });
}

export const stellarNetworks: StellarNetwork[] = ["testnet", "mainnet"];

export const STELLAR_NETWORK: StellarNetwork =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet" ? "mainnet" : "testnet";

export const horizonUrls = {
  testnet:
    process.env.NEXT_PUBLIC_HORIZON_TESTNET_URL ?? "https://horizon-testnet.stellar.org",
  mainnet: process.env.NEXT_PUBLIC_HORIZON_MAINNET_URL ?? "https://horizon.stellar.org"
};

interface NetworkMeta {
  label: string;
  /** Short line the helper cast uses when explaining which chain it is talking to. */
  blurb: string;
  /** Mainnet moves real value, so the UI gives it the cautious tone. */
  tone: "info" | "warning";
}

export const networkMeta: Record<StellarNetwork, NetworkMeta> = {
  testnet: {
    label: "Testnet",
    blurb: "a practice network where XLM has no market value",
    tone: "info"
  },
  mainnet: {
    label: "Mainnet",
    blurb: "the public network where balances hold real value",
    tone: "warning"
  }
};

/**
 * Narrows untrusted input (localStorage, env vars, select values) to a known network.
 * Anything unrecognized falls back to testnet, the safer default for a helper toolkit.
 */
export function normalizeNetwork(value: unknown): StellarNetwork {
  return value === "mainnet" ? "mainnet" : "testnet";
}

export function getNetworkLabel(network: StellarNetwork) {
  return networkMeta[network].label;
}

export function getHorizonServer(network: StellarNetwork = STELLAR_NETWORK) {
  return new Horizon.Server(horizonUrls[network]);
}

// ---------------------------------------------------------------------------
// Typed error codes returned by all Horizon utilities
// ---------------------------------------------------------------------------

export type HorizonErrorCode =
  | "not_found"
  | "rate_limited"
  | "timeout"
  | "server_error"
  | "unknown";

export class HorizonError extends Error {
  constructor(
    public readonly code: HorizonErrorCode,
    message: string
  ) {
    super(message);
    this.name = "HorizonError";
  }
}

function getResponseStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { status?: number } }).response;
    return response?.status;
  }
  return undefined;
}

/**
 * Maps a raw Horizon / network error to a stable {@link HorizonError}.
 * Pass a `context` string (e.g. "account", "transaction") for readable messages.
 */
export function mapHorizonError(error: unknown, context: string): HorizonError {
  const status = getResponseStatus(error);

  if (status === 404) {
    return new HorizonError("not_found", `${context} not found.`);
  }

  if (status === 429) {
    return new HorizonError("rate_limited", "Horizon rate limit reached. Wait a moment and try again.");
  }

  if (
    status === undefined &&
    error instanceof Error &&
    /timeout|network|fetch/i.test(error.message)
  ) {
    return new HorizonError("timeout", "Could not reach Horizon. Check your connection and try again.");
  }

  if (status !== undefined && status >= 500) {
    return new HorizonError("server_error", "Horizon returned a server error. Try again shortly.");
  }

  return new HorizonError("unknown", `Could not load ${context} from Horizon. Try again in a moment.`);
}
