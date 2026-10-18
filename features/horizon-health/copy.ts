import type { HorizonHealthErrorCode } from "./types";
export const copy = {
  submit: "Check endpoint", loading: "Checking Horizon…", reset: "Reset",
  formHint: "Checks the configured Horizon endpoint for the selected network once. No account or secret key is needed.",
  emptyTitle: "Check Horizon before relying on its data", emptyDescription: "Inspect versions, ingestion lag, retained history and available rate-limit headers.",
  resultTitle: "Horizon health", healthy: "Responding within the lag threshold",
  threshold: "More than 5 ledgers of ingestion lag is flagged as degraded. This is a diagnostic threshold, not a guarantee of freshness or availability.",
  unavailable: "Not exposed by endpoint or browser CORS", coreLatest: "Core latest ledger", historyLatest: "Horizon ingested ledger", historyElder: "Oldest retained ledger", lag: "Ingestion lag (ledgers)",
  horizonVersion: "Horizon version", coreVersion: "Stellar Core version", observedAt: "Observed at (UTC)", endpoint: "Endpoint",
  limit: "Rate-limit allowance", remaining: "Rate-limit remaining", rateReset: "Rate-limit reset (raw header)"
} as const;
export const errorCopy: Record<HorizonHealthErrorCode, {title: string; description: string}> = {
  endpoint_unreachable: { title: "Endpoint unreachable", description: "Check your connection and retry, or switch networks to inspect the other configured endpoint." },
  unexpected_response: { title: "Unexpected Horizon response", description: "The endpoint did not return a valid Horizon root document. Retry and check the configured provider." },
  degraded: { title: "Horizon ingestion is lagging", description: "Queries may return stale data. Wait for ingestion to catch up and check again; the observed values remain below." },
  request_failed: { title: "Health check did not complete", description: "The endpoint returned an HTTP failure or exceeded the 10-second timeout. Wait and retry." }
};
