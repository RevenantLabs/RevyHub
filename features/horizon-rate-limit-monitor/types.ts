import type { StellarNetwork } from "@/core/network/types";

export interface MonitorInput { accountId: string | null; lowQuotaThreshold: number }
export type MonitorErrorCode = "invalid_account" | "invalid_threshold" | "missing_headers" | "rate_limited" | "request_failed";
export interface RateLimitHeaders {
  limit: string | null; remaining: string | null; reset: string | null;
  reporting: "reported" | "partial" | "not_reported";
}
export interface EndpointQuota { endpoint: string; headers: RateLimitHeaders; lowQuota: boolean }
export interface MonitorResult {
  network: StellarNetwork; checkedAt: number; lowQuotaThreshold: number; endpoints: EndpointQuota[];
}
export type MonitorState =
  | { status: "idle" } | { status: "loading" }
  | { status: "success"; result: MonitorResult }
  | { status: "error"; code: MonitorErrorCode };
