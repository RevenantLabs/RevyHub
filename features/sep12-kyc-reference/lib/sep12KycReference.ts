import { ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import type { Sep12KycReferenceErrorCode, Sep12KycReferenceInput, Sep12KycReferenceResult } from "@/features/sep12-kyc-reference/types";

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function runSep12KycReference(
  input: Sep12KycReferenceInput,
  _network: StellarNetwork,
  _signal?: AbortSignal
): Promise<Result<Sep12KycReferenceResult, Sep12KycReferenceErrorCode>> {
  return ok({ summary: input.value });
}
