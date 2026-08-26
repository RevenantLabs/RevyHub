import { StrKey } from "@stellar/stellar-sdk";
import { ok, err, type Result } from "@/core/result/result";
import type { SponsoredReservesInput, SponsoredReservesErrorCode } from "./types";

export function parseSponsoredReservesInput(
  accountId: string
): Result<SponsoredReservesInput, SponsoredReservesErrorCode> {
  const input = accountId.trim();

  if (!input) {
    return err("empty_input");
  }

  // Reject anything starting with 'S' early to prevent accidental secret key submission
  if (input.startsWith("S") || !StrKey.isValidEd25519PublicKey(input)) {
    return err("invalid_address");
  }

  return ok({ accountId: input });
}
