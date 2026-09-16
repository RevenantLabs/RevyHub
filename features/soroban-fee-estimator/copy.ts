import type { SorobanFeeEstimatorErrorCode } from "@/features/soroban-fee-estimator/types";

export const copy = {
  formLabel: "Transaction envelope (base64 XDR)",
  formHint:
    "Paste a signed or unsigned Soroban transaction envelope. The estimator reads the declared Soroban resources and computes an approximate fee breakdown.",
  submit: "Estimate fee",
  emptyTitle: "Paste a Soroban envelope",
  emptyDescription:
    "The fee estimator decodes the envelope, reads its Soroban resources, and shows an itemised cost estimate.",
  resultTitle: "Estimated fee",
  declaredFeeLabel: "Declared resource fee",
  inclusionFeeLabel: "Estimated inclusion fee",
  totalFeeLabel: "Estimated total",
  shortfallLabel: "Shortfall vs declared",
  dominantLabel: "Dominant cost driver",
  componentLabel: "Fee breakdown",
  approximationNotice:
    "This is an approximate breakdown. Exact Soroban resource pricing depends on the current ledger's ConfigSetting entries, which are not exposed directly by Soroban RPC.",
  noShortfall: "The declared resource fee covers the estimate.",
} as const;

export const errorCopy: Record<
  SorobanFeeEstimatorErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Paste an envelope first",
    description: "The estimator needs a base64-encoded Soroban transaction envelope to decode.",
  },
  invalid_xdr: {
    title: "Invalid XDR envelope",
    description:
      "The pasted text is not a valid base64 transaction envelope. Copy the full XDR from your wallet or SDK.",
  },
  not_soroban: {
    title: "Not a Soroban transaction",
    description:
      "The envelope decoded successfully but contains no SorobanTransactionData. This tool only works for Soroban smart-contract transactions.",
  },
  pricing_unavailable: {
    title: "Network pricing unavailable",
    description:
      "Soroban RPC did not return inclusion-fee statistics. Try again in a moment or switch network.",
  },
  rpc_error: {
    title: "RPC returned an error",
    description: "The Soroban RPC node reported an error while fetching fee statistics.",
  },
  request_failed: {
    title: "The request did not complete",
    description: "Could not reach the Soroban RPC node. Check your connection and try again.",
  },
};
