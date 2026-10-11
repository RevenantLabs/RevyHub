import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  OfferInspectorErrorCode,
  OfferInspectorField,
  OfferInspectorInput
} from "@/features/offer-inspector/types";

export const FIELD_OF_CODE: Record<OfferInspectorErrorCode, OfferInspectorField | null> = {
  empty_input: "accountId",
  invalid_address: "accountId",
  account_not_found: null,
  rate_limited: null,
  request_failed: null
};

/** Parses raw form input into a validated request, rejecting secret keys before checksum. */
export function parseOfferInspectorInput(
  raw: string
): Result<OfferInspectorInput, OfferInspectorErrorCode> {
  const accountId = raw.replace(/\s+/g, "");

  if (!accountId) {
    return err("empty_input");
  }

  if (accountId.startsWith("S") || !StrKey.isValidEd25519PublicKey(accountId)) {
    return err("invalid_address");
  }

  return ok({ accountId });
}

