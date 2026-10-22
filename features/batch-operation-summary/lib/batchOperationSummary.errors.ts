import type { BatchOperationSummaryErrorCode } from "@/features/batch-operation-summary/types";

export function toBatchOperationSummaryErrorCode(error: unknown): BatchOperationSummaryErrorCode {
  return error instanceof RangeError ? "too_large" : "invalid_xdr";
}
