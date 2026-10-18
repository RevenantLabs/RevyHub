import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  TrustlineErrorCode,
  TrustlineField,
  TrustlineInput
} from "@/features/trustline-checker/types";

/** Stellar asset codes are 1-12 alphanumeric characters (alphanum4 / alphanum12). */
const ASSET_CODE = /^[A-Za-z0-9]{1,12}$/;

export const FIELD_OF_CODE: Record<TrustlineErrorCode, TrustlineField | null> = {
  empty_account: "accountId",
  invalid_account: "accountId",
  empty_asset_code: "assetCode",
  invalid_asset_code: "assetCode",
  empty_issuer: "issuerId",
  invalid_issuer: "issuerId",
  self_issued: "issuerId",
  account_not_found: null,
  rate_limited: null,
  request_failed: null
};

export function parseTrustlineInput(raw: {
  accountId: string;
  assetCode: string;
  issuerId: string;
}): Result<TrustlineInput, TrustlineErrorCode> {
  const accountId = raw.accountId.replace(/\s+/g, "");
  const assetCode = raw.assetCode.trim();
  const issuerId = raw.issuerId.replace(/\s+/g, "");

  if (!accountId) return err("empty_account");
  if (!StrKey.isValidEd25519PublicKey(accountId)) return err("invalid_account");
  if (!assetCode) return err("empty_asset_code");
  if (!ASSET_CODE.test(assetCode)) return err("invalid_asset_code");
  if (!issuerId) return err("empty_issuer");
  if (!StrKey.isValidEd25519PublicKey(issuerId)) return err("invalid_issuer");

  // An issuer never holds a trustline to its own asset, so this is always a
  // mistake rather than a legitimate "no trustline" answer.
  if (accountId === issuerId) return err("self_issued");

  return ok({ accountId, assetCode: assetCode.toUpperCase(), issuerId });
}
