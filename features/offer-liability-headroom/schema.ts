import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type {
  OfferLiabilityHeadroomErrorCode,
  OfferLiabilityHeadroomInput
} from "@/features/offer-liability-headroom/types";

export function parseOfferLiabilityHeadroomInput(
  raw: string
): Result<OfferLiabilityHeadroomInput, OfferLiabilityHeadroomErrorCode> {
  const accountId = normalizeInput(raw);
  if (!accountId || accountId.startsWith("S") || !StrKey.isValidEd25519PublicKey(accountId)) {
    return err("invalid_account");
  }
  return ok({ accountId });
}
