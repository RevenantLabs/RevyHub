import type { MultiAccountAssetExposureErrorCode } from "./types";
export const copy = {
  formLabel: "Public account addresses",
  formHint: "Enter 2–10 unique G addresses, one per line. Only public balances are requested.",
  submit: "Compare balances",
  loading: "Loading public account balances...",
  emptyTitle: "No accounts compared yet",
  emptyDescription: "Enter public accounts to compare native XLM and issued asset balances on the selected network.",
  resultTitle: "Asset exposure",
  accountStatusTitle: "Account fetch status",
  matrixTitle: "Asset by account",
  totalsTitle: "Observed asset totals",
  partialNotice: "Some accounts could not be loaded. Totals include successful accounts only; blank cells are not zero.",
  noAssets: "No native or issued asset balances were returned for these accounts.",
  export: "Download public CSV",
  columnAsset: "Asset",
  columnIssuer: "Issuer",
  columnTotal: "Observed total",
  nativeIssuer: "—",
  missingBalance: "—",
  successStatus: "Loaded",
  csvStatus: "account_status",
  csvAssetType: "asset_type",
  csvAssetCode: "asset_code",
  csvIssuer: "issuer",
  csvTotal: "total",
  csvSuccess: "loaded",
  nativeLabel: "XLM (native)",
  csvFilename: "asset-exposure.csv"
} as const;
export const errorCopy: Record<MultiAccountAssetExposureErrorCode, { title: string; description: string }> = {
  invalid_account: {
    title: "Enter 2–10 valid public accounts",
    description: "Use complete Stellar G addresses only. Remove any secret seed or malformed address, then try again."
  },
  duplicate_account: {
    title: "An account appears more than once",
    description: "Remove repeated addresses so each public account is compared once."
  },
  too_many_accounts: {
    title: "Too many accounts",
    description: "Enter at most 10 public accounts per comparison."
  },
  account_not_found: {
    title: "Account not found",
    description: "Check the selected network and that this account has been funded."
  },
  rate_limited: {
    title: "Horizon is rate limiting requests",
    description: "Wait a moment, then compare the accounts again."
  },
  request_failed: {
    title: "Could not load this account",
    description: "Check your connection and retry the comparison."
  }
};
