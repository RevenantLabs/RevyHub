import type {
  AssetStatisticsErrorCode,
  IssuerFlagKey
} from "@/features/asset-statistics/types";

export const copy = {
  assetCodeLabel: "Asset code",
  assetCodeHint: "Enter 1 to 12 letters or numbers, using the asset's ledger casing.",
  assetCodePlaceholder: "USDC",
  issuerLabel: "Issuer address",
  issuerHint: "Paste the public Stellar address of the issuing account.",
  issuerPlaceholder: "GISSUER...XYZ",
  submit: "Load asset statistics",
  loading: "Loading asset statistics...",
  emptyTitle: "No asset loaded yet",
  emptyDescription:
    "Enter an asset code and issuer to inspect circulating supply, holders, and authorization settings.",
  resultTitle: "Asset statistics",
  assetLabel: "Asset",
  issuerValueLabel: "asset issuer",
  supplyTitle: "Circulating supply",
  circulatingSupplyLabel: "Total circulating supply",
  accountBalancesLabel: "All account balances",
  claimableBalancesLabel: (count: number) => `Claimable balances (${count})`,
  liquidityPoolsLabel: (count: number) => `Liquidity pools (${count})`,
  contractsLabel: (count: number) => `Soroban contracts (${count})`,
  trustlinesTitle: "Account trustline breakdown",
  trustlinesCaption: "Holder counts and balances grouped by authorization state",
  authorizationColumn: "Authorization state",
  holdersColumn: "Holder accounts",
  balanceColumn: "Account balance",
  authorizedLabel: "Authorized",
  liabilitiesOnlyLabel: "Liabilities only",
  unauthorizedLabel: "Unauthorized",
  allAccountsLabel: "All account trustlines",
  flagsTitle: "Issuer authorization flags",
  flagsCaption: "Issuer authorization settings and their meaning for holders",
  flagColumn: "Flag",
  stateColumn: "State",
  meaningColumn: "What it means",
  enabled: "Enabled",
  disabled: "Disabled"
} as const;

export const flagCopy: Record<IssuerFlagKey, { label: string; meaning: string }> = {
  authRequired: {
    label: "auth_required",
    meaning: "The issuer must approve a trustline before it can hold the asset."
  },
  authRevocable: {
    label: "auth_revocable",
    meaning: "The issuer can revoke authorization and freeze a holder's balance."
  },
  authImmutable: {
    label: "auth_immutable",
    meaning: "The issuer's authorization flags are permanently locked."
  },
  authClawbackEnabled: {
    label: "auth_clawback_enabled",
    meaning: "The issuer can claw back this asset from eligible holders."
  }
};

export const errorCopy: Record<AssetStatisticsErrorCode, { title: string; description: string }> = {
  empty_asset_code: {
    title: "Enter an asset code",
    description: "Use the asset's 1 to 12 character code, for example USDC."
  },
  invalid_asset_code: {
    title: "That asset code is not valid",
    description: "Use 1 to 12 letters or numbers with no spaces or punctuation."
  },
  empty_issuer: {
    title: "Enter an issuer address",
    description: "The issuer identifies which asset you want to inspect."
  },
  invalid_issuer: {
    title: "That is not a valid issuer address",
    description:
      "The value failed Stellar's checksum check. Confirm it starts with G and was copied in full."
  },
  asset_not_found: {
    title: "Horizon does not know this asset",
    description:
      "No record matches this exact code and issuer on the selected network. Check the code's casing, issuer, and network."
  },
  rate_limited: {
    title: "Horizon is rate limiting this request",
    description: "Wait a moment, then try loading the asset again."
  },
  request_failed: {
    title: "Could not reach Horizon",
    description: "Check your connection and try loading the asset again."
  }
};
