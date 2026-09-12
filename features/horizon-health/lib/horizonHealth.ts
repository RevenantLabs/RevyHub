import { err, ok, type Result } from "@/core/result/result";
import { HORIZON_URLS } from "@/core/network/config";
import type { StellarNetwork } from "@/core/network/types";
import { toHorizonHealthErrorCode } from "@/features/horizon-health/lib/horizonHealth.errors";
import type {
  HorizonHealthErrorCode,
  HorizonHealthSummary,
  RateLimitInfo
} from "@/features/horizon-health/types";

/** Documented threshold in ledgers beyond which an endpoint is categorized as degraded. */
export const DEGRADED_LAG_THRESHOLD = 3;

interface RawHorizonRoot {
  horizon_version?: unknown;
  core_version?: unknown;
  ingest_latest_ledger?: unknown;
  history_latest_ledger?: unknown;
  history_latest_ledger_closed_at?: unknown;
  history_elder_ledger?: unknown;
  core_latest_ledger?: unknown;
  network_passphrase?: unknown;
  current_protocol_version?: unknown;
  core_supported_protocol_version?: unknown;
}

/** Validates and normalizes raw Horizon root payload and rate-limit headers. */
export function normalizeHorizonHealth(
  data: unknown,
  headers: Headers | Record<string, string | null | undefined>,
  endpointUrl: string,
  network: StellarNetwork
): Result<HorizonHealthSummary, HorizonHealthErrorCode> {
  if (typeof data !== "object" || data === null) {
    return err("unexpected_response");
  }

  const raw = data as RawHorizonRoot;

  if (typeof raw.horizon_version !== "string" || !raw.horizon_version) {
    return err("unexpected_response");
  }
  if (typeof raw.core_version !== "string" || !raw.core_version) {
    return err("unexpected_response");
  }

  const coreLatest = Number(raw.core_latest_ledger);
  const ingestLatest = Number(raw.ingest_latest_ledger);
  const historyElder = Number(raw.history_elder_ledger);
  const historyLatest = Number(raw.history_latest_ledger);

  if (
    !Number.isFinite(coreLatest) ||
    !Number.isFinite(ingestLatest) ||
    !Number.isFinite(historyElder) ||
    !Number.isFinite(historyLatest)
  ) {
    return err("unexpected_response");
  }

  const getHeader = (name: string): string | null => {
    if ("get" in headers && typeof headers.get === "function") {
      return headers.get(name);
    }
    return (headers as Record<string, string | null | undefined>)[name] ?? null;
  };

  const limit = getHeader("x-ratelimit-limit");
  const remaining = getHeader("x-ratelimit-remaining");
  const reset = getHeader("x-ratelimit-reset");

  const rateLimit: RateLimitInfo = {
    limit,
    remaining,
    reset,
    hasHeaders: Boolean(limit || remaining || reset)
  };

  const lag = Math.max(0, coreLatest - ingestLatest);
  const status = lag > DEGRADED_LAG_THRESHOLD ? "degraded" : "healthy";

  return ok({
    horizonVersion: raw.horizon_version,
    coreVersion: raw.core_version,
    coreLatestLedger: coreLatest,
    ingestLatestLedger: ingestLatest,
    historyElderLedger: historyElder,
    historyLatestLedger: historyLatest,
    historyLatestLedgerClosedAt:
      typeof raw.history_latest_ledger_closed_at === "string"
        ? raw.history_latest_ledger_closed_at
        : null,
    networkPassphrase:
      typeof raw.network_passphrase === "string" ? raw.network_passphrase : null,
    currentProtocolVersion:
      typeof raw.current_protocol_version === "number"
        ? raw.current_protocol_version
        : null,
    coreSupportedProtocolVersion:
      typeof raw.core_supported_protocol_version === "number"
        ? raw.core_supported_protocol_version
        : null,
    lag,
    status,
    rateLimit,
    endpointUrl,
    network,
    fetchedAt: new Date().toISOString()
  });
}

/** Fetches and evaluates health metrics for the configured network endpoint. */
export async function getHorizonHealth(
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<HorizonHealthSummary, HorizonHealthErrorCode>> {
  const url = `${HORIZON_URLS[network]}/`;

  try {
    const response = await fetch(url, {
      signal,
      headers: {
        Accept: "application/json, application/hal+json"
      }
    });

    if (response.status === 502 || response.status === 503 || response.status === 504) {
      return err("endpoint_unreachable");
    }

    if (!response.ok) {
      return err("request_failed");
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch {
      return err("unexpected_response");
    }

    return normalizeHorizonHealth(
      json,
      response.headers,
      HORIZON_URLS[network],
      network
    );
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    return err(toHorizonHealthErrorCode(error));
  }
}

export const runHorizonHealth = getHorizonHealth;
