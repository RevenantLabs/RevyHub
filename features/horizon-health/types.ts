import type { StellarNetwork } from "@/core/network/types";

/** Permitted error codes for Horizon health diagnostics. */
export type HorizonHealthErrorCode =
  | "endpoint_unreachable"
  | "unexpected_response"
  | "degraded"
  | "request_failed";

/** Operational health classification of the Horizon endpoint. */
export type EndpointHealthStatus = "healthy" | "degraded";

/** HTTP rate limit information extracted from response headers. */
export interface RateLimitInfo {
  limit: string | null;
  remaining: string | null;
  reset: string | null;
  hasHeaders: boolean;
}

/** Complete normalized health diagnostic summary. */
export interface HorizonHealthSummary {
  horizonVersion: string;
  coreVersion: string;
  coreLatestLedger: number;
  ingestLatestLedger: number;
  historyElderLedger: number;
  historyLatestLedger: number;
  historyLatestLedgerClosedAt: string | null;
  networkPassphrase: string | null;
  currentProtocolVersion: number | null;
  coreSupportedProtocolVersion: number | null;
  lag: number;
  status: EndpointHealthStatus;
  rateLimit: RateLimitInfo;
  endpointUrl: string;
  network: StellarNetwork;
  fetchedAt: string;
}

/** Input request payload indicating when the check was initiated. */
export interface HorizonHealthRequest {
  refreshedAt: number;
}
