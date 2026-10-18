import { classifyHorizonError } from "@/core/horizon/errors";
import type { LedgerCloseCadenceErrorCode } from "@/features/ledger-close-cadence/types";

export function toLedgerCloseCadenceErrorCode(error: unknown): LedgerCloseCadenceErrorCode {
  const { code } = classifyHorizonError(error);

  if (code === "rate_limited") return "rate_limited";
  if (code === "not_found") return "history_unavailable";
  return "request_failed";
}

export class HorizonStatusError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Horizon responded with ${status}`);
    this.name = "HorizonStatusError";
    this.status = status;
  }
}
