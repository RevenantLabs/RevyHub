import type { ReserveCalculatorErrorCode } from "@/features/reserve-calculator/types";

export const copy = {
  formLabel: "Account address",
  formHint: "Paste a public Stellar account address starting with G. No secret key is needed.",
  formNetworkHint: (network: string) => `Reading from ${network}.`,
  placeholder: "GABC...XYZ",
  submit: "Calculate reserve",
  loading: "Calculating reserve...",
  emptyTitle: "No reserve calculated yet",
  emptyDescription:
    "Load an account to see its minimum XLM balance, reserve breakdown, and spendable balance.",
  resultTitle: "Reserve summary",
  spendableLabel: "Spendable balance",
  minimumBalanceLabel: "Minimum balance",
  nativeBalanceLabel: "Native balance",
  sellingLiabilitiesLabel: "Selling liabilities",
  baseReserveLabel: "Base reserve",
  sourceLedgerLabel: "Source ledger",
  breakdownTitle: "Minimum balance breakdown",
  breakdownDescription:
    "The current base reserve is applied to the account, its subentries, and sponsorship adjustments.",
  baseAccountLabel: "Base account reserve (2 × base reserve)",
  subentriesLabel: (count: number) => `Subentries (${count} × base reserve)`,
  sponsoringLabel: (count: number) => `Entries sponsored by this account (+${count})`,
  sponsoredLabel: (count: number) => `Entries sponsored for this account (−${count})`,
  belowMinimumTitle: "This account is below its minimum balance",
  belowMinimumDescription:
    "Its native XLM balance is lower than the reserve required by its current ledger entries.",
  sourceNote: (sequence: string) => `Base reserve read from live ledger ${sequence}.`
} as const;

export const errorCopy: Record<ReserveCalculatorErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Enter an account address",
    description: "Paste a public Stellar address starting with G to calculate its reserve."
  },
  invalid_address: {
    title: "That is not a valid account address",
    description:
      "The address failed Stellar's checksum check. Confirm it starts with G and was copied in full."
  },
  account_not_found: {
    title: "This account does not exist on the selected network",
    description:
      "Check the network switch in the header, or fund the account before trying again."
  },
  rate_limited: {
    title: "Horizon is rate limiting this request",
    description: "Wait a moment, then try the calculation again."
  },
  request_failed: {
    title: "Could not load reserve data",
    description: "Check your connection and try again."
  }
};
