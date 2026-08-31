import type { BalanceViewerErrorCode } from "@/features/balance-viewer/types";

export const copy = {
  formLabel: "Account address",
  formHint: "Paste a Stellar account address starting with G. Balances are public data.",
  submit: "Load balances",
  loading: "Loading balances...",
  emptyTitle: "No account loaded yet",
  emptyDescription:
    "Paste an account address to see every asset it holds on the selected network.",
  resultTitle: "Balances",
  filterLabel: "Filter balances",
  filterHint: "Matches asset code or issuer address. Searching XLM includes the native balance.",
  filterPlaceholder: "e.g. USDC or issuer address",
  filterEmptyTitle: "No balances match this filter",
  filterEmptyDescription: "Try a different asset code or issuer address, or clear the filter to see every line.",
  noBalancesTitle: "This account holds no balances",
  noBalancesDescription:
    "The account exists but currently has no asset lines. This is unusual — every funded account holds at least a native XLM balance.",
  columnAsset: "Asset",
  columnBalance: "Balance",
  columnIssuer: "Issuer",
  columnLimit: "Limit",
  columnLiabilities: "Liabilities"
} as const;

export const errorCopy: Record<
  BalanceViewerErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Enter an account address",
    description: "Paste a Stellar address starting with G to load its balances."
  },
  invalid_address: {
    title: "That is not a valid account address",
    description:
      "The value failed Stellar's checksum check. Confirm it starts with G and was copied in full."
  },
  account_not_found: {
    title: "This account does not exist on the selected network",
    description:
      "Accounts only exist once they are funded. Check the network switch in the header, or fund a testnet account with the Testnet Faucet tool."
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
