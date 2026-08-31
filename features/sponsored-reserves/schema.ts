import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  SponsoredReservesErrorCode,
  SponsoredReservesInput
} from "@/features/sponsored-reserves/types";

/** Parses a public account address without ever retaining rejected input. */
export function parseSponsoredReservesInput(
  raw: string
): Result<SponsoredReservesInput, SponsoredReservesErrorCode> {
  const accountId = raw.replace(/\s+/g, "");

  if (!accountId) return err("empty_input");
  if (accountId.startsWith("S")) return err("invalid_address");
  if (!StrKey.isValidEd25519PublicKey(accountId)) return err("invalid_address");

  return ok({ accountId });
}
