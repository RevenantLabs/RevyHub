import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { AccountOffersErrorCode } from "@/features/account-offers-inspector/types";

export function parseAccountOffersInput(
  raw: string
): Result<{ accountId: string }, AccountOffersErrorCode> {
  const accountId = raw.replace(/\s+/g, "");

  if (!accountId) return err("empty_input");
  if (!StrKey.isValidEd25519PublicKey(accountId)) return err("invalid_address");

  return ok({ accountId });
}
