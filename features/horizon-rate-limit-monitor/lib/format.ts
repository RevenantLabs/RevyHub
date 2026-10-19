import { copy } from "@/features/horizon-rate-limit-monitor/copy";
import type { RateLimitHeaders } from "@/features/horizon-rate-limit-monitor/types";
export function formatHeader(value: string | null): string { return value ?? copy.unavailable; }
export function formatReporting(status: RateLimitHeaders["reporting"]): string {
  return status === "reported" ? copy.reported : status === "partial" ? copy.partial : copy.notReported;
}
export function formatCheckedAt(epochMs: number): string { return new Date(epochMs).toLocaleString(); }
