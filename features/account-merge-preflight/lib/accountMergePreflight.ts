import { ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import type { AccountMergePreflightErrorCode, AccountMergePreflightInput, AccountMergePreflightResult } from "@/features/account-merge-preflight/types";

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function runAccountMergePreflight(
  input: AccountMergePreflightInput,
  _network: StellarNetwork,
  _signal?: AbortSignal
): Promise<Result<AccountMergePreflightResult, AccountMergePreflightErrorCode>> {
  return ok({ summary: input.value });
}
