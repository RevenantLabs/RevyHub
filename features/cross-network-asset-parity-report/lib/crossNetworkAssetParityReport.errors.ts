import { classifyHorizonError } from "@/core/horizon/errors"
import type { ParityErrorCode } from "@/features/cross-network-asset-parity-report/types"

export function toCrossNetworkAssetParityReportErrorCode(error: unknown): ParityErrorCode {
  const classified = classifyHorizonError(error)
  if (classified.code === "not_found") return "not_found"
  if (classified.code === "rate_limited") return "rate_limited"
  if (classified.code === "bad_request") return "invalid_input"
  return "request_failed"
}
