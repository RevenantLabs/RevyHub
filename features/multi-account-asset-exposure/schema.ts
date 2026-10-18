import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { MultiAccountAssetExposureErrorCode as Code, MultiAccountAssetExposureInput as Input } from "./types";

/** One public G address per line, comma, or whitespace-separated token. */
export function parseMultiAccountAssetExposureInput(raw: string): Result<Input, Code> {
  const accountIds = raw.trim().split(/[\s,]+/).filter(Boolean);
  // Reject even malformed seeds before checking count or checksum. Never echo them.
  if (accountIds.some((id) => /^s/i.test(id))) return err("invalid_account");
  if (accountIds.length > 10) return err("too_many_accounts");
  if (accountIds.length < 2 || accountIds.some((id) => !StrKey.isValidEd25519PublicKey(id))) {
    return err("invalid_account");
  }
  if (new Set(accountIds).size !== accountIds.length) return err("duplicate_account");
  return ok({ accountIds });
}
