import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  MemoRequiredCheckerErrorCode,
  MemoRequiredCheckerInput,
  MemoRequiredField
} from "@/features/memo-required-checker/types";

export const FIELD_OF_CODE: Record<MemoRequiredCheckerErrorCode, MemoRequiredField | null> = {
  invalid_account: "accountId",
  account_not_found: null,
  malformed_data_entry: null,
  toml_unreachable: null,
  rate_limited: null,
  request_failed: null
};

export function parseMemoRequiredCheckerInput(raw: {
  accountId: string;
}): Result<MemoRequiredCheckerInput, MemoRequiredCheckerErrorCode> {
  const accountId = raw.accountId.replace(/\s+/g, "");
  if (!accountId || StrKey.isValidEd25519SecretSeed(accountId) || !StrKey.isValidEd25519PublicKey(accountId)) {
    return err("invalid_account");
  }
  return ok({ accountId });
}
