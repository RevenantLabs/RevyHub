import type { OfferLiabilityHeadroomErrorCode } from "@/features/offer-liability-headroom/types";

export const copy = {
  formLabel: "Account address",
  formHint: "G-address on the selected network. Secret keys are rejected.",
  submit: "Audit offer liabilities",
  loading: "Reading account balances and offers...",
  emptyTitle: "No liability snapshot yet",
  emptyDescription:
    "Inspect an account's offers next to balance and liability fields. Estimates never guarantee that an offer will execute.",
  summaryTitle: "Snapshot",
  offersTitle: "Active offers",
  liabilitiesTitle: "Balances and liabilities",
  warningsTitle: "Snapshot warnings",
  networkLabel: "Network",
  accountLabel: "Account",
  accountLedgerLabel: "Account ledger",
  offersLedgerLabel: "Offers ledger",
  unmatchedLabel: "Offers without a matching balance row",
  disclaimer:
    "Displayed estimates are diagnostic only. They do not guarantee order book execution or future fill capacity.",
  skewWarning:
    "Account and offers were read from different ledger cursors. Treat liability pairing as approximate.",
  unmatchedWarning:
    "Some offers reference assets with no matching current balance row on the account payload.",
  noOffers: "No open offers on this account.",
  noBalances: "No balances returned for this account.",
  sellingLabel: "Selling",
  buyingLabel: "Buying",
  amountLabel: "Amount",
  priceLabel: "Price (exact)",
  balanceLabel: "Balance",
  sellingLiabilitiesLabel: "Selling liabilities",
  buyingLiabilitiesLabel: "Buying liabilities",
  limitLabel: "Trustline limit",
  availableLabel: "Estimated headroom to sell"
} as const;

export const errorCopy: Record<
  OfferLiabilityHeadroomErrorCode,
  { title: string; description: string }
> = {
  invalid_account: {
    title: "Account address is not valid",
    description: "Paste a G-address. Secret keys (S…) are never accepted."
  },
  account_not_found: {
    title: "Account was not found",
    description: "Horizon has no record for this address on the selected network."
  },
  malformed_offer: {
    title: "Offer records could not be used",
    description:
      "Horizon returned offers without usable asset identities, amounts or rational prices."
  },
  inconsistent_snapshot: {
    title: "Account and offers could not be paired safely",
    description:
      "The two Horizon reads disagree too strongly to present a reliable liability snapshot. Try again."
  },
  rate_limited: {
    title: "Horizon is rate limiting this request",
    description: "Wait a moment before auditing again."
  },
  request_failed: {
    title: "The request did not complete",
    description: "Horizon responded with an error or the connection failed."
  }
};
