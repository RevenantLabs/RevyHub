import os

base_dir = "features/asset-statistics"

types_ts = """export interface AssetStatisticsInput {
  assetCode: string;
  issuerId: string;
}

export interface AssetStatisticsResult {
  assetCode: string;
  issuerId: string;
  supply: string;
  claimableBalancesAmount: string;
  numClaimableBalances: number;
  flags: {
    authRequired: boolean;
    authRevocable: boolean;
    authImmutable: boolean;
    clawbackEnabled: boolean;
  };
  accounts: {
    authorized: number;
    authorizedToMaintainLiabilities: number;
    unauthorized: number;
  };
  balances: {
    authorized: string;
    authorizedToMaintainLiabilities: string;
    unauthorized: string;
  };
}

export type AssetStatisticsErrorCode =
  | "empty_asset_code"
  | "invalid_asset_code"
  | "empty_issuer"
  | "invalid_issuer"
  | "asset_not_found"
  | "rate_limited"
  | "request_failed";

export type AssetStatisticsField = "assetCode" | "issuerId";
"""

schema_ts = """import { StrKey } from "@stellar/stellar-sdk";
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

export function parseAssetStatisticsInput(raw: {
  assetCode: string;
  issuerId: string;
}): Result<AssetStatisticsInput, AssetStatisticsErrorCode> {
  const assetCode = raw.assetCode.trim();
  const issuerId = raw.issuerId.replace(/\\s+/g, "");

  if (!assetCode) return err("empty_asset_code");
  if (!ASSET_CODE.test(assetCode)) return err("invalid_asset_code");
  if (!issuerId) return err("empty_issuer");
  if (!StrKey.isValidEd25519PublicKey(issuerId)) return err("invalid_issuer");

  return ok({ assetCode: assetCode.toUpperCase(), issuerId });
}
"""

copy_ts = """import type { AssetStatisticsErrorCode } from "@/features/asset-statistics/types";

export const copy = {
  assetCodeLabel: "Asset code",
  assetCodeHint: "1 to 12 letters or numbers, for example USDC.",
  issuerLabel: "Issuer address",
  issuerHint: "The account that issues the asset.",
  submit: "Check statistics",
  loading: "Loading...",
  emptyTitle: "No asset checked yet",
  emptyDescription: "Enter an asset code and issuer address to view supply and holder statistics.",
  resultTitle: "Asset Statistics",
  supplyTitle: "Supply",
  holdersTitle: "Trustline Holders",
  flagsTitle: "Issuer Flags",
  claimableBalancesTitle: "Claimable Balances"
} as const;

export const errorCopy: Record<AssetStatisticsErrorCode, { title: string; description: string }> = {
  empty_asset_code: { title: "Enter an asset code", description: "For example USDC or EURC." },
  invalid_asset_code: {
    title: "That asset code is not valid",
    description: "Stellar asset codes are 1 to 12 letters or numbers, with no punctuation."
  },
  empty_issuer: { title: "Enter an issuer address", description: "The issuer identifies which asset you mean." },
  invalid_issuer: {
    title: "The issuer address is not valid",
    description: "It must be a Stellar address starting with G that passes the checksum."
  },
  asset_not_found: {
    title: "Asset not found",
    description: "No asset matching this code and issuer exists on the selected network."
  },
  rate_limited: {
    title: "Horizon is rate limiting this request",
    description: "Wait a moment before checking again."
  },
  request_failed: {
    title: "Could not reach Horizon",
    description: "The request did not complete. Check your connection and try again."
  }
};
"""

with open(f"{base_dir}/types.ts", "w") as f: f.write(types_ts)
with open(f"{base_dir}/schema.ts", "w") as f: f.write(schema_ts)
with open(f"{base_dir}/copy.ts", "w") as f: f.write(copy_ts)
