import type { ErrorCode } from "./types";

export const copy = {
  title: "Liquidity Pool ID Calculator",
  description:
    "Compute a constant-product liquidity pool's deterministic ID from two reserve assets and a fee — entirely offline, before the pool necessarily exists.",
  submit: "Compute pool ID",
  reset: "Reset",
  emptyTitle: "Enter two assets and a fee",
  emptyDescription: "This tool is fully offline — it never makes a network request.",
  resultTitle: "Pool ID",
  rejected: "Secret keys are discarded and never sent.",
  fields: {
    assetXCode: { label: "Asset 1 code", hint: "Leave blank, or enter XLM / native, for the native asset." },
    assetXIssuer: { label: "Asset 1 issuer", hint: "A G… issuer account. Leave blank for the native asset." },
    assetYCode: { label: "Asset 2 code", hint: "Leave blank, or enter XLM / native, for the native asset." },
    assetYIssuer: { label: "Asset 2 issuer", hint: "A G… issuer account. Leave blank for the native asset." },
    feeBps: { label: "Pool fee (basis points)", hint: "An integer from 0 to 10000. Stellar-core currently only creates 30 bps pools." }
  },
  orderingTitle: "Canonical ordering",
  assetALabel: "Asset A (lexicographically first)",
  assetBLabel: "Asset B (lexicographically second)",
  swappedNote: "The inputs were swapped to match the protocol's required order.",
  notSwappedNote: "The inputs already matched the protocol's required order.",
  poolIdLabel: "Pool ID (hex)",
  feeLabel: "Fee"
} as const;

export const errorCopy: Record<ErrorCode, { title: string; description: string }> = {
  identical_assets: {
    title: "Assets must be distinct",
    description: "A liquidity pool needs two different assets. Enter two distinct assets."
  },
  invalid_fee: {
    title: "Invalid fee",
    description: "Enter a whole number of basis points from 0 to 10000."
  },
  invalid_asset: {
    title: "Invalid asset",
    description: "Enter a valid asset code (1–12 alphanumeric characters) and a G… issuer, or leave both blank for the native asset."
  }
};
