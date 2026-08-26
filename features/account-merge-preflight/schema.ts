import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import { StrKey } from "@stellar/stellar-sdk";
import type { AccountMergePreflightErrorCode, AccountMergePreflightInput } from "@/features/account-merge-preflight/types";

export function parseAccountMergePreflightInput(
  rawSource: string,
  rawDestination: string
): Result<AccountMergePreflightInput, AccountMergePreflightErrorCode> {
  const source = normalizeInput(rawSource);
  const destination = normalizeInput(rawDestination);

  if (!source) return err("empty_source");
  if (!StrKey.isValidEd25519PublicKey(source)) return err("invalid_source");

  if (!destination) return err("empty_destination");
  if (!StrKey.isValidEd25519PublicKey(destination)) return err("invalid_destination");

  if (source === destination) return err("same_account");

  return ok({ source, destination });
}
