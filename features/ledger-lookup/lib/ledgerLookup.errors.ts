import { classifyHorizonError } from "@/core/horizon/errors";
import type { LedgerErrorCode } from "@/features/ledger-lookup/types";

/** Maps Horizon transport errors to ledger lookup error codes. */
export function toLedgerLookupErrorCode(error: unknown): LedgerErrorCode {
  const { code } = classifyHorizonError(error);
  if (code === "not_found") return "ledger_not_found";
  if (code === "rate_limited") return "rate_limited";
  return "request_failed";
}
