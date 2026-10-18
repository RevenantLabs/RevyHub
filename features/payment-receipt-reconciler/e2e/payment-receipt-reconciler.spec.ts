export const spec = {
  route: "/tools/payment-receipt-reconciler",
  steps: [
    { action: "visit", target: "/tools/payment-receipt-reconciler" },
    { action: "expect", target: "heading", value: "Payment Receipt Reconciler" },
    { action: "fill", target: "Transaction hash", value: "<64 hex characters>" },
    { action: "click", target: "Reconcile receipt" },
    { action: "expect", target: "text", value: "Public receipt" },
    { action: "expect", target: "text", value: "Payment operations" },
    { action: "expect", target: "text", value: "Effect evidence" },
    { action: "expect", target: "text", value: "Exact totals" },
    { action: "switchNetwork", value: "mainnet" },
    { action: "expect", target: "text", value: "No receipt reconciled yet" }
  ]
} as const;
