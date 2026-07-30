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
