import { classifyHorizonError } from "@/core/horizon/errors";
import type { LedgerLookupErrorCode } from "../types";
export function toLedgerLookupErrorCode(error: unknown): LedgerLookupErrorCode {
 const {code} = classifyHorizonError(error); return code === "not_found" ? "ledger_not_found" : code === "rate_limited" ? "rate_limited" : "request_failed";
}
