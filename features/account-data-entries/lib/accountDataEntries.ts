import { ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import type { AccountDataEntriesErrorCode, AccountDataEntriesInput, AccountDataEntriesResult } from "@/features/account-data-entries/types";

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function runAccountDataEntries(
  input: AccountDataEntriesInput,
  _network: StellarNetwork,
  _signal?: AbortSignal
): Promise<Result<AccountDataEntriesResult, AccountDataEntriesErrorCode>> {
  return ok({ summary: input.value });
}
