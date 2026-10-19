import type { MonitorErrorCode } from "@/features/horizon-rate-limit-monitor/types";
export function responseError(status: number): MonitorErrorCode { return status === 429 ? "rate_limited" : "request_failed"; }
export function transportError(): MonitorErrorCode { return "request_failed"; }
