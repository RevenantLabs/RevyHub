import type { RegulatedAssetInspectorErrorCode } from "@/features/regulated-asset-inspector/types";

export const copy = {
  issuerLabel: "Issuer account",
  issuerHint: "A G-address. Secret seeds are rejected and never sent.",
  assetLabel: "Asset code",
  assetHint: "The code published in the issuer's stellar.toml CURRENCIES entry.",
  submit: "Inspect regulated status",
  loading: "Reading issuer metadata...",
  emptyTitle: "No asset inspected yet",
  emptyDescription:
    "Enter an issuer account and asset code to see whether that issuer publishes the asset as SEP-8 regulated.",
  resultTitle: "SEP-8 declaration",
  selfPublishedTitle: "Self-published by the issuer",
  selfPublishedDescription:
    "Every field below comes from the issuer's own stellar.toml or Horizon account record. Nothing here is independently verified, and a regulated flag does not prove AUTH_REQUIRED or AUTH_REVOCABLE is set.",
  regulatedLabel: "Regulated",
  notRegulatedLabel: "Not regulated",
  omittedFieldNote: "The matched currency omits the regulated field, so this asset is explicitly not regulated.",
  approvalServerLabel: "Approval server",
  approvalCriteriaLabel: "Approval criteria",
  notDeclared: "Not declared",
  flagsTitle: "Issuer account flags (Horizon)",
  flagsHint: "Ledger flags are shown separately and are not inferred from the regulated declaration.",
  homeDomainLabel: "Home domain",
  tomlUrlLabel: "stellar.toml"
} as const;

export const errorCopy: Record<
  RegulatedAssetInspectorErrorCode,
  { title: string; description: string }
> = {
  invalid_account: {
    title: "Enter a valid issuer account",
    description: "Use a Stellar G-address. Secret seeds are rejected before any request is made."
  },
  invalid_asset_code: {
    title: "Enter a valid asset code",
    description: "Asset codes are 1–12 letters or digits."
  },
  account_not_found: {
    title: "That issuer account was not found",
    description: "Horizon has no account for this address on the selected network."
  },
  missing_home_domain: {
    title: "The issuer publishes no home domain",
    description: "SEP-8 status lives in stellar.toml, and this account has no home_domain to fetch it from."
  },
  toml_unreachable: {
    title: "The stellar.toml could not be fetched",
    description: "The home domain did not serve /.well-known/stellar.toml. That is not the same as an unregulated asset."
  },
  currency_not_found: {
    title: "That asset is not in the stellar.toml",
    description: "No CURRENCIES entry matches this code and issuer."
  },
  malformed_toml: {
    title: "The stellar.toml could not be parsed",
    description: "The file was fetched, but its CURRENCIES section is not well-formed."
  }
};
