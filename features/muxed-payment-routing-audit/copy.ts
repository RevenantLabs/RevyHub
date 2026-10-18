import type { MuxedPaymentRoutingAuditErrorCode } from "@/features/muxed-payment-routing-audit/types";
export const copy = {
  formLabel: "Base account address",
  formHint: "Enter a public G address. Secret seeds and muxed M addresses are not accepted.",
  submit: "Audit recent payments",
  loading: "Fetching recent payment pages…",
  emptyTitle: "Audit an account's payment routes",
  emptyDescription: "See which recent incoming payments name a muxed ID and which name only the base address.",
  resultTitle: "Incoming payment routes",
  noPayments: "No incoming payments were found in this sample.",
  coverageTitle: "Bounded history sample",
  coverage: (pages: number, limit: number, hasMore: boolean, scanned: number) => `${pages} of at most ${limit} pages fetched; ${scanned} operations scanned.${hasMore ? " Older payments may exist." : " No older page was indicated."} Totals cover this sample only.`,
  directGroup: "Direct base-address payments (no muxed ID)",
  muxedGroup: (id: string) => `Muxed ID ${id}`,
  paymentCount: (count: number) => `${count} payment${count === 1 ? "" : "s"}`,
  totalsTitle: "Totals by asset",
  paymentRowsTitle: "Payments",
  paymentDate: "Date",
  paymentAmount: "Amount",
  paymentTransaction: "Transaction",
  assetIssuer: "Issuer",
  nativeAsset: "XLM",
  unknownDate: "Unknown date",
  utcSuffix: " UTC"
} as const;
export const errorCopy: Record<MuxedPaymentRoutingAuditErrorCode, { title: string; description: string }> = {
  invalid_account: { title: "Enter a public base account", description: "Use a valid Stellar G address. Never paste a secret seed or muxed M address." },
  account_not_found: { title: "Account not found", description: "Check the G address and selected network, then try again." },
  invalid_cursor: { title: "Payment paging stopped", description: "Horizon returned an invalid or repeated paging token. Retry the audit later." },
  malformed_payment: { title: "Payment data could not be read", description: "Horizon returned an incomplete or inconsistent payment. Retry later or check another network." },
  rate_limited: { title: "Horizon rate limit reached", description: "Wait a moment before running this audit again." },
  request_failed: { title: "Payment request failed", description: "Check your connection and selected network, then retry." }
};
