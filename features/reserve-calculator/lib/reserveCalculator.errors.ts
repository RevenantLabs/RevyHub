import { classifyHorizonError } from "@/core/horizon/errors";
import type { ReserveCalculatorErrorCode } from "@/features/reserve-calculator/types";

export function toReserveCalculatorErrorCode(error: unknown): ReserveCalculatorErrorCode {
  const { code } = classifyHorizonError(error);

  if (code === "not_found") return "account_not_found";
  if (code === "rate_limited") return "rate_limited";
  return "request_failed";
}
