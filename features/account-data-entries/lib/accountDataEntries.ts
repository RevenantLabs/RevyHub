import { err, ok, type Result } from "@/core/result/result";
import type { AccountDataEntriesErrorCode, AccountDataEntriesResult, AccountDataEntry } from "../types";
import { decodeDataEntry } from "./format";

export async function fetchAccountDataEntries(
  accountId: string, 
  networkUrl: string
): Promise<Result<AccountDataEntriesResult, AccountDataEntriesErrorCode>> {
  try {
    const res = await fetch(`${networkUrl}/accounts/${accountId}`);
    if (res.status === 404) {
      return err("account_not_found");
    }
    if (!res.ok) {
      return err("request_failed");
    }
    
    const data = await res.json();
    const dataMapping: Record<string, string> = data.data || {};
    
    const entries: AccountDataEntry[] = Object.entries(dataMapping).map(([key, rawBase64]) => {
      const decoded = decodeDataEntry(rawBase64);
      return {
        key,
        rawBase64,
        ...decoded
      };
    });
    
    return ok({ entries });
  } catch {
    return err("request_failed");
  }
}
