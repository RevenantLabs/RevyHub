import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { AccountActivityRollupInput, AccountActivityRollupErrorCode } from "@/features/account-activity-rollup/types";

/** Never preserve a rejected secret in feature state or error copy. */
export function parseAccountActivityRollupInput(raw: string): Result<AccountActivityRollupInput, AccountActivityRollupErrorCode> {
  const accountId = raw.trim();
  if (accountId.startsWith("S") || !StrKey.isValidEd25519PublicKey(accountId)) return err("invalid_account");
  return ok({ accountId });
}

export function parseActivityCursor(raw: unknown): Result<string, AccountActivityRollupErrorCode> {
  if (typeof raw !== "string" || !/^[0-9]+$/.test(raw)) return err("invalid_cursor");
  return ok(raw);
}
