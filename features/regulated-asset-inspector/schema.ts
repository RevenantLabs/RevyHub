import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  RegulatedAssetField,
  RegulatedAssetInspectorErrorCode,
  RegulatedAssetInspectorInput
} from "@/features/regulated-asset-inspector/types";

const ASSET_CODE = /^[A-Za-z0-9]{1,12}$/;

export const FIELD_OF_CODE: Record<RegulatedAssetInspectorErrorCode, RegulatedAssetField | null> = {
  invalid_account: "issuerId",
  invalid_asset_code: "assetCode",
  account_not_found: null,
  missing_home_domain: null,
  toml_unreachable: null,
  currency_not_found: null,
  malformed_toml: null
};

export function parseRegulatedAssetInspectorInput(raw: {
  issuerId: string;
  assetCode: string;
}): Result<RegulatedAssetInspectorInput, RegulatedAssetInspectorErrorCode> {
  const issuerId = raw.issuerId.replace(/\s+/g, "");
  const assetCode = raw.assetCode.trim();

  if (!issuerId || StrKey.isValidEd25519SecretSeed(issuerId) || !StrKey.isValidEd25519PublicKey(issuerId)) {
    return err("invalid_account");
  }

  if (!ASSET_CODE.test(assetCode)) return err("invalid_asset_code");

  return ok({ issuerId, assetCode: assetCode.toUpperCase() });
}
