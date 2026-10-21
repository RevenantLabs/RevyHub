import type { ErrorCode } from "./types";

export const copy = {
  title: "Clawback Eligibility Checker",
  description:
    "Check whether a holder's trustline for an asset is currently clawback-eligible, by reading the issuer's account-level flag and the holder's own trustline-level flag separately.",
  submit: "Check eligibility",
  loading: "Reading both accounts…",
  reset: "Reset",
  emptyTitle: "Enter the issuer, holder and asset code",
  emptyDescription: "Both accounts are read in parallel; a problem with one does not block reading the other.",
  resultTitle: "Eligibility report",
  rejected: "Secret keys are discarded and never sent.",
  fields: {
    issuerAccountId: { label: "Issuer account", hint: "A G… account ID — the asset's issuer." },
    holderAccountId: { label: "Holder account", hint: "A G… account ID — the trustline holder." },
    assetCode: { label: "Asset code", hint: "1–12 alphanumeric characters, e.g. USDC." }
  },
  issuerSignalTitle: "Issuer signal",
  holderSignalTitle: "Holder signal",
  issuerFlagLabel: "auth_clawback_enabled",
  holderFlagLabel: "is_clawback_enabled",
  verdictTitle: "Verdict",
  disagreementNote:
    "These two flags disagree. A trustline created before the issuer enabled auth_clawback_enabled can keep its own clawback-enabled flag independent of the issuer's current setting — never infer one from the other."
} as const;

export const errorCopy: Record<ErrorCode, { title: string; description: string }> = {
  invalid_account: {
    title: "Invalid input",
    description: "Enter two G… account IDs and a 1–12 character asset code. Secret seeds are rejected before any request."
  },
  issuer_not_found: {
    title: "Issuer account not found",
    description: "No account exists for the issuer ID on the selected network."
  },
  holder_not_found: {
    title: "Holder account not found",
    description: "No account exists for the holder ID on the selected network."
  },
  no_trustline: {
    title: "Holder has no trustline for this asset",
    description: "The holder account exists, but has no trustline to this asset code from this issuer — a distinct outcome from an ineligible trustline."
  },
  rate_limited: {
    title: "Rate limited",
    description: "Horizon is throttling requests. Wait a moment and try again."
  },
  request_failed: {
    title: "Request failed",
    description: "The account lookup did not complete. Check the selected network and try again."
  }
};
