import type { HorizonHealthErrorCode } from "@/features/horizon-health/types";

export const copy = {
  submit: "Run diagnostic",
  refresh: "Refresh diagnostic",
  loading: "Querying Horizon root endpoint...",
  emptyTitle: "Diagnostic not run yet",
  emptyDescription:
    "Check the configured Horizon endpoint's version, ingestion lag, history range, and rate-limit headroom to verify that queries will return fresh data.",
  resultTitle: "Horizon Endpoint Diagnostic",
  endpointLabel: "Endpoint URL",
  statusLabel: "Health status",
  coreLedgerLabel: "Core latest ledger",
  ingestLedgerLabel: "Ingested latest ledger",
  lagLabel: "Ingestion gap",
  historyRangeLabel: "Available history range",
  historyElderLabel: "Elder ledger",
  historyLatestLabel: "Latest history ledger",
  historyClosedAtLabel: "Latest ledger closed at",
  horizonVersionLabel: "Horizon version",
  coreVersionLabel: "Stellar Core version",
  protocolVersionLabel: "Protocol version",
  networkPassphraseLabel: "Network passphrase",
  rateLimitTitle: "Rate-limit headroom",
  rateLimitDescription: "Rate-limit headroom reported by endpoint",
  rateLimitLimitLabel: "Request limit",
  rateLimitRemainingLabel: "Remaining requests",
  rateLimitResetLabel: "Reset window",
  rateLimitAbsent: "No rate-limit headers reported by endpoint",
  rateLimitPresent: "Active rate limits detected",
  healthyTitle: "Horizon is healthy and in sync",
  healthyDescription:
    "Ingestion is keeping pace with Stellar Core. Queries to this endpoint will return up-to-date ledger state.",
  degradedTitle: "Horizon ingestion lag detected",
  degradedDescription:
    "Horizon is lagging behind Stellar Core by more than the acceptable threshold. Recent transactions and state changes may not be reflected in queries yet.",
  thresholdNotice: "Degraded threshold: > 3 ledgers lag",
  readingNetwork: "Diagnosing configured Horizon endpoint for",
  fetchedAtLabel: "Diagnosed at"
} as const;

export const errorCopy: Record<HorizonHealthErrorCode, { title: string; description: string }> = {
  endpoint_unreachable: {
    title: "Endpoint unreachable",
    description:
      "The Horizon endpoint did not respond. Check your network connection or switch to an alternate network."
  },
  unexpected_response: {
    title: "Unexpected response format",
    description:
      "The endpoint responded, but the response was not a valid Horizon root document. Verify the endpoint configuration."
  },
  degraded: {
    title: "Ingestion lag exceeds threshold",
    description:
      "Horizon is lagging behind Stellar Core by more than 3 ledgers. Avoid relying on this endpoint for time-sensitive queries until ingestion catches up."
  },
  request_failed: {
    title: "Diagnostic request failed",
    description:
      "A transport failure or server error occurred while contacting the endpoint. Wait a moment and click refresh."
  }
};
