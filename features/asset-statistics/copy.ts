import type { AssetStatisticsErrorCode } from "@/features/asset-statistics/types";

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
