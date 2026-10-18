import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  AccountSignersErrorCode,
  AccountSignersInput
} from "@/features/account-signers/types";

/** Parses an account address locally. No network request is made here. */
export function parseAccountSignersInput(
  raw: string
): Result<AccountSignersInput, AccountSignersErrorCode> {
  const accountId = raw.replace(/\s+/g, "");

  if (!accountId) return err("empty_input");
  // Reject a secret seed on prefix alone, before attempting a checksum check.
  if (accountId.startsWith("S")) return err("invalid_address");
  if (!StrKey.isValidEd25519PublicKey(accountId)) return err("invalid_address");

  return ok({ accountId });
}
