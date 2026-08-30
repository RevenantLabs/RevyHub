import type { ClaimableBalancesErrorCode } from "@/features/claimable-balances/types";

export const copy = {
  modeLabel: "Lookup mode",
  modeAccount: "By claimant account",
  modeBalance: "By balance ID",
  accountLabel: "Claimant account",
  accountHint: "List every claimable balance this account can claim.",
  accountPlaceholder: "GABC...XYZ",
  balanceLabel: "Claimable balance ID",
  balanceHint: "64 hexadecimal characters, as shown by any Stellar explorer.",
  balancePlaceholder: "00000000a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef",
  submit: "Explore claimable balances",
  loading: "Loading claimable balances...",
  emptyTitle: "No claimable balances explored yet",
  emptyDescription:
    "Look up a balance by ID or list every balance a claimant account can claim, with each predicate translated into plain English.",
  resultTitle: "Claimable balances",
  resultTitleSingle: "Claimable balance",
  listCount: (count: number) =>
    count === 1 ? "1 claimable balance" : `${count} claimable balances`,
  noBalancesTitle: "No claimable balances found",
  noBalancesDescription:
    "Horizon returned an empty list for this claimant on the selected network.",
  claimantsTitle: "Claimants",
  claimableNow: "Claimable now",
  notClaimableNow: "Not claimable now",
  fundedAtLabel: "Funded at",
  sponsorLabel: "Sponsor",
  ledgerLabel: "Last modified ledger"
} as const;

export const errorCopy: Record<ClaimableBalancesErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Enter a value first",
    description: "Choose a lookup mode and paste the claimant account or claimable balance ID."
  },
  invalid_input: {
    title: "That value is not valid",
    description:
      "Claimant accounts start with G and are 56 characters long. Balance IDs are exactly 64 hexadecimal characters."
  },
  balance_not_found: {
    title: "No claimable balance with this ID on the selected network",
    description:
      "Check the network switch in the header — a testnet balance does not exist on mainnet, and the reverse is also true."
  },
  rate_limited: {
    title: "Horizon is rate limiting this request",
    description: "Wait a moment before looking up another claimable balance."
  },
  request_failed: {
    title: "Could not reach Horizon",
    description: "The request did not complete. Check your connection and try again."
  }
};
