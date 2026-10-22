import { ok, type Result } from "@/core/result/result";
import { decodeOperations } from "@/features/batch-operation-summary/lib/operation-decode";
import { countOperationTypes } from "@/features/batch-operation-summary/lib/operation-type-counts";
import type { StellarNetwork } from "@/core/network/types";
import type { BatchOperationSummaryErrorCode, BatchOperationSummaryInput, BatchOperationSummaryResult } from "@/features/batch-operation-summary/types";

export async function runBatchOperationSummary(input: BatchOperationSummaryInput, _network?: StellarNetwork, _signal?: AbortSignal): Promise<Result<BatchOperationSummaryResult, BatchOperationSummaryErrorCode>> {
  const decoded = decodeOperations(input.envelope);
  if (!decoded.ok) return decoded;
  return ok({
    operationTotal: decoded.value.operations.length,
    typeCounts: countOperationTypes(decoded.value.operations),
    nativeAmountStroops: decoded.value.operations.reduce((sum, operation) => sum + BigInt(operation.nativeStroops ?? "0"), 0n).toString(),
    transactionSource: decoded.value.transactionSource,
    operationSources: decoded.value.operationSources
  });
}
