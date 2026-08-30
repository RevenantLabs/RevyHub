import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { AccountDataEntriesErrorCode, AccountDataEntriesInput } from "./types";
import { StrKey } from "@stellar/stellar-sdk";

export function parseAccountDataEntriesInput(raw: string): Result<AccountDataEntriesInput, AccountDataEntriesErrorCode> {
  const value = normalizeInput(raw);
  if (!value) return err("empty_input");
  if (!StrKey.isValidEd25519PublicKey(value)) {
    return err("invalid_account_id");
  }
  return ok({ accountId: value });
}
