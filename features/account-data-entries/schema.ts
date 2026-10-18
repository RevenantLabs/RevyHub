import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { AccountDataEntriesErrorCode, AccountDataEntriesInput } from "@/features/account-data-entries/types";

/** Parses raw form input into a validated request, without throwing. */
export function parseAccountDataEntriesInput(raw: string): Result<AccountDataEntriesInput, AccountDataEntriesErrorCode> {
  const accountId = raw.replace(/\s+/g, "");

  if (!accountId) return err("empty_input");
  // Reject secret seeds on their prefix before doing any checksum work.
  if (accountId.startsWith("S")) return err("invalid_address");
  if (!StrKey.isValidEd25519PublicKey(accountId)) return err("invalid_address");

  return ok({ accountId });
}
