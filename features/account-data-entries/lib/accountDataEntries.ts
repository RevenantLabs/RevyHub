import { err, ok, type Result } from "@/core/result/result";
import { horizonServer } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { toAccountDataEntriesErrorCode } from "@/features/account-data-entries/lib/accountDataEntries.errors";
import { decodeAccountDataValue } from "@/features/account-data-entries/lib/format";
import type {
  AccountDataEntriesErrorCode,
  AccountDataEntriesInput,
  AccountDataEntriesResult,
  AccountDataEntry
} from "@/features/account-data-entries/types";

export function normalizeAccountDataEntries(
  data: Record<string, string>
): AccountDataEntry[] {
  return Object.entries(data)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, rawBase64]) => ({
      key,
      rawBase64,
      value: decodeAccountDataValue(rawBase64)
    }));
}

export async function runAccountDataEntries(
  input: AccountDataEntriesInput,
  network: StellarNetwork,
  _signal?: AbortSignal
): Promise<Result<AccountDataEntriesResult, AccountDataEntriesErrorCode>> {
  try {
    const account = await horizonServer(network).loadAccount(input.accountId);
    const data = typeof account.data === "object" && account.data !== null ? account.data : {};

    return ok({
      accountId: account.accountId(),
      entries: normalizeAccountDataEntries(data as Record<string, string>)
    });
  } catch (error) {
    return err(toAccountDataEntriesErrorCode(error));
  }
}
