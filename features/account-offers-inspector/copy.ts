import type { AccountOffersErrorCode } from "@/features/account-offers-inspector/types";

export const copy = {
  formLabel: "Account address",
  formHint: "Paste a Stellar account address starting with G to see its open offers.",
  submit: "Load offers",
  loading: "Loading offers...",
  emptyTitle: "No account loaded yet",
  emptyDescription: "Paste an account address to see every open offer.",
  resultTitle: "Open Offers",
  noOffersTitle: "No open offers",
  noOffersDescription: "This account has no open offers at the moment.",
  columnId: "Offer ID",
  columnSelling: "Selling",
  columnBuying: "Buying",
  columnAmount: "Amount",
  columnPrice: "Price",
  lastModified: "Last Modified",
} as const;

export const errorCopy: Record<
  AccountOffersErrorCode,
  { title: string; description: string }
> = {
  empty_input: { title: "Enter an account address", description: "Paste a Stellar address starting with G." },
  invalid_address: { title: "That is not a valid account address", description: "Confirm it starts with G and was copied in full." },
  account_not_found: { title: "Account not found", description: "Check the network switch in the header." },
  rate_limited: { title: "Rate limited", description: "Wait a moment and try again." },
  request_failed: { title: "Could not reach Horizon", description: "Check your connection and try again." },
};
