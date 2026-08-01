import type { StellarNetwork } from "@/lib/stellar/horizon";

export const sorobanRpcUrls: Record<StellarNetwork, string> = {
  testnet: process.env.NEXT_PUBLIC_SOROBAN_RPC_TESTNET_URL ?? "https://soroban-testnet.stellar.org",
  mainnet: process.env.NEXT_PUBLIC_SOROBAN_RPC_MAINNET_URL ?? "https://soroban-mainnet.stellar.org"
};

export type SorobanRpcState =
  | "healthy"
  | "unhealthy"
  | "stale"
  | "timeout"
  | "wrong-network"
  | "malformed"
  | "partial"
  | "error";

export interface SorobanRpcDiagnostic {
  state: SorobanRpcState;
  network: StellarNetwork;
  rpcUrl: string;
  latencyMs: number;
  lastCheckedAt: string;
  health?: string;
  latestLedger?: number;
  protocolVersion?: number;
  ledgerClosedAt?: string;
  freshnessSeconds?: number;
  freshnessAvailable: boolean;
  message: string;
}

interface JsonRpcSuccess<T> { jsonrpc?: string; id?: number; result?: T; error?: never }
interface JsonRpcFailure { jsonrpc?: string; id?: number; error: { code?: number; message?: string; data?: unknown } }
type JsonRpcResponse<T> = JsonRpcSuccess<T> | JsonRpcFailure;

interface HealthResult { status?: unknown }
interface LatestLedgerResult {
  sequence?: unknown;
  protocolVersion?: unknown;
  closedAt?: unknown;
  network?: unknown;
  networkPassphrase?: unknown;
}

const networkPassphrases: Record<StellarNetwork, string> = {
  testnet: "Test SDF Network ; September 2015",
  mainnet: "Public Global Stellar Network ; September 2015"
};

const staleAfterSeconds = 90;
const defaultTimeoutMs = 5000;

export class SorobanRpcError extends Error {
  constructor(public readonly state: SorobanRpcState, message: string) {
    super(message);
  }
}

export function normalizeJsonRpcError(response: unknown): SorobanRpcError | null {
  if (!isRecord(response) || !isRecord(response.error)) return null;
  const code = typeof response.error.code === "number" ? ` (${response.error.code})` : "";
  const message = typeof response.error.message === "string" ? response.error.message : "JSON-RPC error";
  return new SorobanRpcError("error", `${message}${code}`);
}

export function createSorobanRpcController() {
  let controller: AbortController | null = null;

  return {
    abort() {
      controller?.abort();
    },
    nextSignal() {
      controller?.abort();
      controller = new AbortController();
      return controller.signal;
    }
  };
}

export async function checkSorobanRpc(
  network: StellarNetwork,
  options: { signal?: AbortSignal; timeoutMs?: number; now?: Date; fetcher?: typeof fetch } = {}
): Promise<SorobanRpcDiagnostic> {
  const rpcUrl = sorobanRpcUrls[network];
  const started = Date.now();
  const now = options.now ?? new Date();
  const timeoutMs = options.timeoutMs ?? defaultTimeoutMs;
  const fetcher = options.fetcher ?? fetch;
  const timeout = new AbortController();
  const timeoutId = setTimeout(() => timeout.abort(), timeoutMs);
  const signal = combineSignals([options.signal, timeout.signal]);

  try {
    const [health, latest] = await Promise.all([
      callRpc<HealthResult>(fetcher, rpcUrl, "getHealth", signal),
      callRpc<LatestLedgerResult>(fetcher, rpcUrl, "getLatestLedger", signal)
    ]);
    return evaluateDiagnostic(network, rpcUrl, Date.now() - started, now, health, latest);
  } catch (error) {
    const state = timeout.signal.aborted ? "timeout" : error instanceof SorobanRpcError ? error.state : "error";
    return {
      state,
      network,
      rpcUrl,
      latencyMs: Date.now() - started,
      lastCheckedAt: now.toISOString(),
      freshnessAvailable: false,
      message: error instanceof Error ? error.message : "Soroban RPC request failed."
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callRpc<T>(fetcher: typeof fetch, rpcUrl: string, method: string, signal: AbortSignal): Promise<T> {
  const response = await fetcher(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method }),
    signal
  });
  const payload = (await response.json().catch(() => null)) as JsonRpcResponse<T> | null;
  const rpcError = normalizeJsonRpcError(payload);
  if (rpcError) throw rpcError;
  if (!response.ok || !isRecord(payload) || !("result" in payload)) {
    throw new SorobanRpcError("malformed", "RPC returned a malformed response.");
  }
  return payload.result as T;
}

function evaluateDiagnostic(network: StellarNetwork, rpcUrl: string, latencyMs: number, now: Date, health: HealthResult, latest: LatestLedgerResult): SorobanRpcDiagnostic {
  const healthStatus = typeof health.status === "string" ? health.status : undefined;
  const sequence = typeof latest.sequence === "number" ? latest.sequence : undefined;
  const protocolVersion = typeof latest.protocolVersion === "number" ? latest.protocolVersion : undefined;
  const closedAt = typeof latest.closedAt === "string" ? latest.closedAt : undefined;
  const passphrase = typeof latest.networkPassphrase === "string" ? latest.networkPassphrase : typeof latest.network === "string" ? latest.network : undefined;
  const freshnessSeconds = closedAt && !Number.isNaN(Date.parse(closedAt)) ? Math.max(0, Math.round((now.getTime() - Date.parse(closedAt)) / 1000)) : undefined;
  const partial = sequence === undefined || protocolVersion === undefined;
  let state: SorobanRpcState = "healthy";
  let message = "Soroban RPC is healthy and serving recent ledger data.";
  if (passphrase && passphrase !== networkPassphrases[network]) {
    state = "wrong-network"; message = "RPC latest ledger belongs to a different network.";
  } else if (healthStatus !== "healthy") {
    state = "unhealthy"; message = `RPC health is ${healthStatus ?? "unavailable"}.`;
  } else if (partial) {
    state = "partial"; message = "RPC responded but omitted supported latest-ledger fields.";
  } else if (freshnessSeconds === undefined) {
    state = "partial"; message = "Latest-ledger freshness is unavailable from the RPC response.";
  } else if (freshnessSeconds > staleAfterSeconds) {
    state = "stale"; message = "RPC latest ledger appears stale.";
  }
  return { state, network, rpcUrl, latencyMs, lastCheckedAt: now.toISOString(), health: healthStatus, latestLedger: sequence, protocolVersion, ledgerClosedAt: closedAt, freshnessSeconds, freshnessAvailable: freshnessSeconds !== undefined, message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function combineSignals(signals: Array<AbortSignal | undefined>): AbortSignal {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signals.filter(Boolean).forEach((signal) => {
    if (signal?.aborted) abort();
    else signal?.addEventListener("abort", abort, { once: true });
  });
  return controller.signal;
}
