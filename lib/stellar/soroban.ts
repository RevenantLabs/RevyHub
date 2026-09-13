import type { StellarNetwork } from "@/lib/stellar/horizon";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Soroban RPC endpoints.  Never user-supplied — configured per supported
 * network so arbitrary RPC URLs cannot be injected via query parameters.
 */
export const sorobanRpcUrls: Record<StellarNetwork, string> = {
  testnet:
    process.env.NEXT_PUBLIC_SOROBAN_RPC_TESTNET_URL ??
    "https://soroban-testnet.stellar.org",
  mainnet:
    process.env.NEXT_PUBLIC_SOROBAN_RPC_MAINNET_URL ??
    "https://soroban.stellar.org"
};

/** Default fetch timeout (ms). */
export const SOROBAN_TIMEOUT_MS = 10_000;

/** A ledger is considered "stale" when its close time is older than this. */
export const STALE_LEDGER_SECONDS = 120;

/** Network passphrases for identifying which Stellar network an RPC serves. */
export const networkPassphrases: Record<StellarNetwork, string> = {
  testnet: "Test SDF Network ; September 2015",
  mainnet: "Public Global Stellar Network ; September 2015"
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SorobanHealthResult {
  /** "healthy" or explicit error description. */
  status: string;
  /** Latest ledger sequence (0 if unknown). */
  latestLedger: number;
  /** Latest ledger close time as unix epoch seconds (0 if unknown). */
  latestLedgerCloseTime: number;
  /** Oldest retained ledger sequence (0 if unknown). */
  oldestLedger: number;
  /** Oldest ledger close time (0 if unknown). */
  oldestLedgerCloseTime: number;
  /** How many ledgers the node retains (0 if unknown). */
  ledgerRetentionWindow: number;
}

export interface SorobanGetNetworkResult {
  friendbotUrl?: string;
  passphrase: string;
  protocolVersion: string;
}

export interface SorobanLatestLedgerResult {
  /** Ledger hash. */
  id: string;
  /** Sequence number. */
  sequence: number;
  /** Protocol version string. */
  protocolVersion: string;
  /** Close time (unix epoch seconds, 0 if unavailable). */
  closeTime: number;
}

export interface SorobanDiagnosticResult {
  health: SorobanHealthResult;
  latestLedger: SorobanLatestLedgerResult;
  /** Request round-trip latency in milliseconds. */
  latencyMs: number;
  /** Unix-epoch seconds when the check was performed. */
  checkedAt: number;
  /** Seconds since the latest ledger closed (or null if unavailable). */
  freshnessSeconds: number | null;
}

// ---------------------------------------------------------------------------
// JSON-RPC helpers
// ---------------------------------------------------------------------------

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params?: unknown;
}

interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

interface JsonRpcResponse<T> {
  jsonrpc: "2.0";
  id: number;
  result?: T;
  error?: JsonRpcError;
}

let jsonRpcId = 1;

async function rpcCall<T>(
  url: string,
  method: string,
  signal?: AbortSignal
): Promise<T> {
  const body: JsonRpcRequest = {
    jsonrpc: "2.0",
    id: jsonRpcId++,
    method
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal
  });

  if (!response.ok) {
    throw new SorobanRpcError(
      "unreachable",
      `RPC endpoint returned HTTP ${response.status} ${response.statusText}`
    );
  }

  const json: JsonRpcResponse<T> = await response.json();

  if (json.error) {
    throw new SorobanRpcError(
      "rpc_error",
      `JSON-RPC error [${json.error.code}]: ${json.error.message}`
    );
  }

  if (json.result === undefined) {
    throw new SorobanRpcError(
      "malformed",
      "JSON-RPC response missing both result and error fields"
    );
  }

  return json.result;
}

// ---------------------------------------------------------------------------
// Custom error
// ---------------------------------------------------------------------------

export type SorobanErrorKind =
  | "unreachable"
  | "timeout"
  | "wrong_network"
  | "unhealthy"
  | "stale"
  | "malformed"
  | "rpc_error"
  | "unknown";

export class SorobanRpcError extends Error {
  kind: SorobanErrorKind;

  constructor(kind: SorobanErrorKind, message: string) {
    super(message);
    this.name = "SorobanRpcError";
    this.kind = kind;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Perform a full Soroban RPC diagnostic on the given network.
 *
 * Calls `getHealth` and `getLatestLedger` in parallel, measures latency,
 * and returns a consolidated result.  Pass an `AbortSignal` from an
 * `AbortController` to cancel in-flight requests.
 *
 * @throws {SorobanRpcError} on any failure (timeout, unreachable, malformed, etc.)
 */
export async function sorobanDiagnostic(
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<SorobanDiagnosticResult> {
  const url = sorobanRpcUrls[network];
  const startedAt = performance.now();

  // Wrap the signal in a timeout-aware controller so we can distinguish
  // timeout from explicit user cancellation.
  const timeoutMs = SOROBAN_TIMEOUT_MS;

  // Create a controller that races the external signal against a timeout.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new DOMException("Timeout", "TimeoutError")), timeoutMs);

  // If the caller provided a signal, forward its abort.
  const onAbort = () => {
    clearTimeout(timeoutId);
    controller.abort(signal?.reason);
  };
  signal?.addEventListener("abort", onAbort, { once: true });

  try {
    // Issue RPC calls in parallel.
    const [health, latestLedger, netInfo] = await Promise.all([
      rpcCall<SorobanHealthResult>(url, "getHealth", controller.signal),
      rpcCall<SorobanLatestLedgerResult>(url, "getLatestLedger", controller.signal),
      rpcCall<SorobanGetNetworkResult>(url, "getNetwork", controller.signal)
    ]);

    // Detect wrong-network state.
    if (netInfo.passphrase !== networkPassphrases[network]) {
      throw new SorobanRpcError(
        "wrong_network",
        `Soroban RPC reports network "${netInfo.passphrase}" but expected "${networkPassphrases[network]}"`
      );
    }

    // Detect unhealthy state from response.
    if (health.status !== "healthy") {
      throw new SorobanRpcError(
        "unhealthy",
        `Soroban RPC reports status: ${health.status}`
      );
    }

    const latencyMs = Math.round(performance.now() - startedAt);
    const checkedAt = Math.floor(Date.now() / 1000);

    let freshnessSeconds: number | null = null;
    // Prefer closeTime from latestLedger response; fall back to health's closeTime.
    const closeTime = latestLedger.closeTime || health.latestLedgerCloseTime || 0;
    if (closeTime > 0) {
      freshnessSeconds = Math.max(0, checkedAt - closeTime);

      // Detect stale ledger state.
      if (freshnessSeconds > STALE_LEDGER_SECONDS) {
        throw new SorobanRpcError(
          "stale",
          `Latest ledger is ${freshnessSeconds}s old (threshold: ${STALE_LEDGER_SECONDS}s). Ledger ingestion may be stalled.`
        );
      }
    }

    return { health, latestLedger, latencyMs, checkedAt, freshnessSeconds };
  } catch (error) {
    const elapsed = Math.round(performance.now() - startedAt);

    if (error instanceof SorobanRpcError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new SorobanRpcError(
        "timeout",
        `Soroban RPC did not respond within ${timeoutMs}ms (elapsed: ${elapsed}ms)`
      );
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      // User-initiated cancellation.
      throw new SorobanRpcError(
        "unknown",
        "Request was cancelled."
      );
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new SorobanRpcError(
        "unreachable",
        `Soroban RPC endpoint is unreachable: ${error.message}`
      );
    }

    throw new SorobanRpcError(
      "unknown",
      error instanceof Error ? error.message : String(error)
    );
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", onAbort);
  }
}

/**
 * Returns a human-readable label for ledger freshness.
 */
export function describeFreshness(freshnessSeconds: number | null): string {
  if (freshnessSeconds === null) {
    return "Unavailable";
  }
  if (freshnessSeconds < 5) {
    return "Just closed";
  }
  if (freshnessSeconds < 60) {
    return `${freshnessSeconds}s ago`;
  }
  if (freshnessSeconds < 3600) {
    return `${Math.floor(freshnessSeconds / 60)}m ${freshnessSeconds % 60}s ago`;
  }
  return `${Math.floor(freshnessSeconds / 3600)}h ${Math.floor((freshnessSeconds % 3600) / 60)}m ago`;
}
