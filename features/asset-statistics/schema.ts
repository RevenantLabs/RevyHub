import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  AssetStatisticsErrorCode,
  AssetStatisticsField,
  AssetStatisticsInput
} from "@/features/asset-statistics/types";

const ASSET_CODE = /^[A-Za-z0-9]{1,12}$/;

export const FIELD_OF_CODE: Record<AssetStatisticsErrorCode, AssetStatisticsField | null> = {
  empty_asset_code: "assetCode",
  invalid_asset_code: "assetCode",
  empty_issuer: "issuerId",
  invalid_issuer: "issuerId",
  asset_not_found: null,
  rate_limited: null,
  request_failed: null
};

/** Parses raw form input into a validated request, without throwing. */
export function parseAssetStatisticsInput(raw: {
  assetCode: string;
  issuerId: string;
}): Result<AssetStatisticsInput, AssetStatisticsErrorCode> {
  const assetCode = raw.assetCode.trim();
  const issuerId = raw.issuerId.replace(/\s+/g, "");

  if (!assetCode) return err("empty_asset_code");
  if (!ASSET_CODE.test(assetCode)) return err("invalid_asset_code");
  if (!issuerId) return err("empty_issuer");
  if (issuerId.startsWith("S")) return err("invalid_issuer");
  if (!StrKey.isValidEd25519PublicKey(issuerId)) return err("invalid_issuer");

  return ok({ assetCode, issuerId });
}
