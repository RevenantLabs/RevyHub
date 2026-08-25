import type { TrustlineErrorCode } from "@/features/trustline-checker/types";

export const copy = {
  accountLabel: "Account address",
  accountHint: "The account you want to check, starting with G.",
  assetCodeLabel: "Asset code",
  assetCodeHint: "1 to 12 letters or numbers, for example USDC.",
  issuerLabel: "Issuer address",
  issuerHint: "The account that issues the asset. Getting this wrong is the most common mistake.",
  submit: "Check trustline",
  loading: "Checking...",
  emptyTitle: "No trustline checked yet",
  emptyDescription:
    "Enter an account, an asset code and the issuer address to see whether the trustline exists.",
  foundTitle: "Trustline found",
  missingTitle: "No trustline for this asset and issuer",
  resultTitle: "Trustline details",
  otherIssuersTitle: "This account trusts the same code from a different issuer"
} as const;

export const errorCopy: Record<TrustlineErrorCode, { title: string; description: string }> = {
  empty_account: { title: "Enter an account address", description: "The account to check is required." },
  invalid_account: {
    title: "The account address is not valid",
    description: "It must be a Stellar address starting with G that passes the checksum."
  },
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
  self_issued: {
    title: "The account and the issuer are the same",
    description:
      "An issuing account never holds a trustline to its own asset. Check whether you pasted the same address twice."
  },
  account_not_found: {
    title: "This account does not exist on the selected network",
    description:
      "Accounts only exist once they are funded. Confirm the network switch in the header matches where the account lives."
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
