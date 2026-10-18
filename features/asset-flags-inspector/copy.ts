import type { AssetFlagsInspectorErrorCode } from "@/features/asset-flags-inspector/types";

export const copy = {
  formLabel: "Issuer address",
  formHint:
    "Paste the issuing account's public key (starting with G). Authorization flags are set on the issuer, not on individual assets.",
  submit: "Inspect flags",
  loading: "Loading issuer flags...",
  emptyTitle: "No issuer inspected yet",
  emptyDescription:
    "Enter an issuing account address to see its authorization flags and what each one lets the issuer do to holders.",
  resultTitle: "Issuer authorization flags",
  issuerLabel: "Issuing account",
  flagColumn: "Flag",
  stateColumn: "State",
  meaningColumn: "What it means for holders",
  summaryTitle: "Summary",
  calloutsTitle: "Important notes",
  scopeNote:
    "Flags apply to assets this account issues. They do not change how assets issued by other accounts behave."
} as const;

export const errorCopy: Record<
  AssetFlagsInspectorErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Enter an issuer address",
    description: "Paste the public key of the account that issues the asset."
  },
  invalid_address: {
    title: "That is not a valid issuer address",
    description:
      "The value failed Stellar's checksum check. Confirm it starts with G and was copied in full."
  },
  account_not_found: {
    title: "This account does not exist on the selected network",
    description:
      "Accounts only exist once they are funded. Check the network switch in the header matches where the issuer lives."
  },
  rate_limited: {
    title: "Horizon is rate limiting this request",
    description: "Too many requests were made in a short window. Wait a moment and try again."
  },
  request_failed: {
    title: "Could not reach Horizon",
    description: "The request did not complete. Check your connection and try again."
  }
};
