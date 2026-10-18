import { classifyHorizonError } from "@/core/horizon/errors";
import type { MuxedPaymentRoutingAuditErrorCode } from "@/features/muxed-payment-routing-audit/types";
export function toMuxedPaymentRoutingAuditErrorCode(error: unknown): MuxedPaymentRoutingAuditErrorCode {
  const { code } = classifyHorizonError(error);
  if (code === "not_found") return "account_not_found";
  if (code === "rate_limited") return "rate_limited";
  if (code === "bad_request") return "invalid_cursor";
  return "request_failed";
}
