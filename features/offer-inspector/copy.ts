import type { OfferInspectorErrorCode } from "@/features/offer-inspector/types";

export const copy = {
  formLabel: "Account address",
  formHint:
    "Paste a Stellar account address starting with G. Open offers and DEX liabilities are public data.",
  submit: "Inspect offers",
  loading: "Loading open offers...",
  loadingMore: "Loading more offers...",
  emptyTitle: "No account loaded yet",
  emptyDescription:
    "Paste an account address to inspect its open offers, price ratios, and reserve consumption.",
  resultTitle: "Open Offers",
  noOffersTitle: "No open offers",
  noOffersDescription:
    "This account exists on the selected network but currently has no open offers on the decentralized exchange order book.",
  tableAriaLabel: "Open offers table",
  columnOfferId: "Offer ID",
  columnSelling: "Selling",
  columnBuying: "Buying",
  columnAmount: "Amount",
  columnPrice: "Price",
  columnSponsor: "Sponsor",
  columnLedger: "Ledger",
  reserveSummaryTitle: "Gross Reserve Requirements",
  reserveLoadedSummary: "Loaded offers consume base reserves directly on the Stellar ledger.",
  sponsorshipNotice:
    "Each open offer consumes 1 base reserve entry (subentry). Sponsorship can change which account pays this reserve. A partial page only reflects loaded offers, not the account-wide total.",
  partialBadge: "Partial list",
  completeBadge: "Complete list",
  partialWarning:
    "Showing loaded offers only. This partial page cannot establish total account liabilities or total DEX reserves.",
  loadMore: "Load more offers",
  offersCount: "Loaded offers",
  grossReserveLabel: "Gross reserve for loaded offers",
  baseReserveLabel: "Network base reserve"
} as const;

export const errorCopy: Record<OfferInspectorErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Enter an account address",
    description: "Paste a Stellar public key starting with G to inspect its open offers."
  },
  invalid_address: {
    title: "That is not a valid account address",
    description:
      "The value failed Stellar's checksum check or has an invalid prefix. Secret keys starting with S are never accepted."
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

