import { horizonUrls, networkPassphrases, STELLAR_NETWORK, type StellarNetwork } from "@/lib/stellar/horizon";

export type HorizonHealthStatus =
  | "healthy"
  | "stale-ledger"
  | "wrong-network"
  | "timeout"
  | "network-error"
  | "malformed-response";

export interface HorizonHealthResult {
  status: HorizonHealthStatus;
  message: string;
  latencyMs?: number;
  horizonVersion?: string;
  networkPassphrase?: string;
  expectedNetworkPassphrase?: string;
  currentLedger?: number;
  ledgerClosedAt?: string;
  ledgerAgeSeconds?: number;
}

export interface HorizonHealthOptions {
  timeoutMs?: number;
  staleAfterSeconds?: number;
  signal?: AbortSignal;
}

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_STALE_AFTER_SECONDS = 60;

interface HorizonRootShape {
  horizon_version: string;
  network_passphrase: string;
  history_latest_ledger: number;
  history_latest_ledger_closed_at: string;
}

function isHorizonRootShape(value: unknown): value is HorizonRootShape {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const root = value as Record<string, unknown>;

  return (
    typeof root.horizon_version === "string" &&
    typeof root.network_passphrase === "string" &&
    typeof root.history_latest_ledger === "number" &&
    typeof root.history_latest_ledger_closed_at === "string"
  );
}

export async function checkHorizonHealth(
  network: StellarNetwork = STELLAR_NETWORK,
  options: HorizonHealthOptions = {}
): Promise<HorizonHealthResult> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    staleAfterSeconds = DEFAULT_STALE_AFTER_SECONDS,
    signal: externalSignal
  } = options;

  const controller = new AbortController();
  let timedOut = false;

  const onExternalAbort = () => controller.abort();
  externalSignal?.addEventListener("abort", onExternalAbort);

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const startedAt = Date.now();

  try {
    const response = await fetch(horizonUrls[network], { signal: controller.signal });
    const latencyMs = Date.now() - startedAt;

    if (!response.ok) {
      return {
        status: "network-error",
        message: `Horizon responded with HTTP ${response.status}.`,
        latencyMs
      };
    }

    let root: unknown;

    try {
      root = await response.json();
    } catch {
      return {
        status: "malformed-response",
        message: "Horizon's root response was not valid JSON.",
        latencyMs
      };
    }

    if (!isHorizonRootShape(root)) {
      return {
        status: "malformed-response",
        message: "Horizon's root response was missing expected fields.",
        latencyMs
      };
    }

    const expectedNetworkPassphrase = networkPassphrases[network];
    const ledgerAgeSeconds = (Date.now() - new Date(root.history_latest_ledger_closed_at).getTime()) / 1000;

    const shared = {
      latencyMs,
      horizonVersion: root.horizon_version,
      networkPassphrase: root.network_passphrase,
      expectedNetworkPassphrase,
      currentLedger: root.history_latest_ledger,
      ledgerClosedAt: root.history_latest_ledger_closed_at,
      ledgerAgeSeconds
    };

    if (root.network_passphrase !== expectedNetworkPassphrase) {
      return {
        status: "wrong-network",
        message: `Horizon reports network passphrase "${root.network_passphrase}", but ${network} expects "${expectedNetworkPassphrase}".`,
        ...shared
      };
    }

    if (ledgerAgeSeconds > staleAfterSeconds) {
      return {
        status: "stale-ledger",
        message: `The latest ledger closed ${Math.round(ledgerAgeSeconds)}s ago, older than the ${staleAfterSeconds}s freshness threshold.`,
        ...shared
      };
    }

    return {
      status: "healthy",
      message: `Horizon is reachable and reporting a fresh ledger (${Math.round(ledgerAgeSeconds)}s old).`,
      ...shared
    };
  } catch (error) {
    if (controller.signal.aborted && !timedOut) {
      throw error;
    }

    const latencyMs = Date.now() - startedAt;

    if (timedOut) {
      return {
        status: "timeout",
        message: `Horizon did not respond within ${Math.round(timeoutMs / 1000)}s.`,
        latencyMs
      };
    }

    return {
      status: "network-error",
      message: "Could not reach Horizon. Check your network connection or the endpoint URL.",
      latencyMs
    };
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", onExternalAbort);
  }
}
