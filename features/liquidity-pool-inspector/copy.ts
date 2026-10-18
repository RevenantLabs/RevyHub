import type { LiquidityPoolInspectorErrorCode } from "@/features/liquidity-pool-inspector/types";

export const copy = {
  formLabel: "Liquidity pool ID",
  formHint: "64 hexadecimal characters, as shown in balances and pool share trustlines.",
  submit: "Inspect pool",
  loading: "Inspecting...",
  emptyTitle: "No pool inspected yet",
  emptyDescription:
    "Paste a liquidity pool ID to see its reserves, share supply, participant count, fee and implied prices.",
  resultTitle: "Pool details",
  reservesTitle: "Reserves",
  pricingTitle: "Implied price",
  shareValueTitle: "Value of one pool share",
  participantsMembers: "Pool members",
  participantsTrustlines: "Share trustlines",
  pricePrecisionNote: (digits: number) =>
    `Prices and share values are derived from reserves using ${digits}-decimal fixed-point arithmetic.`
} as const;

export const errorCopy: Record<LiquidityPoolInspectorErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Enter a liquidity pool ID",
    description: "Paste the 64-character pool ID you want to inspect."
  },
  invalid_pool_id: {
    title: "That is not a liquidity pool ID",
    description:
      "Pool IDs are exactly 64 hexadecimal characters (0-9 and a-f). Account addresses start with G and belong in other tools."
  },
  pool_not_found: {
    title: "No pool with this ID on the selected network",
    description:
      "Check the network switch in the header — a testnet pool does not exist on mainnet, and the reverse is also true."
  },
  rate_limited: {
    title: "Horizon is rate limiting this request",
    description: "Wait a moment before inspecting another pool."
  },
  request_failed: {
    title: "Could not reach Horizon",
    description: "The request did not complete. Check your connection and try again."
  }
};
