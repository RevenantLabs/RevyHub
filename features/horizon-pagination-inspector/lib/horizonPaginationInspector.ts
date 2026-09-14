import { ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import type { HorizonPaginationInspectorErrorCode, HorizonPaginationInspectorInput, HorizonPaginationInspectorResult } from "@/features/horizon-pagination-inspector/types";

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function runHorizonPaginationInspector(
  input: HorizonPaginationInspectorInput,
  _network: StellarNetwork,
  _signal?: AbortSignal
): Promise<Result<HorizonPaginationInspectorResult, HorizonPaginationInspectorErrorCode>> {
  return ok({ summary: input.value });
}
