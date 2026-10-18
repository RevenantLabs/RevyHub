export const spec = {
  route: "/tools/payment-receipt-reconciler",
  steps: [
    { action: "visit", target: "/tools/payment-receipt-reconciler" },
    { action: "expect", target: "heading", value: "Payment Receipt Reconciler" },
    {
      action: "fill",
      target: "Transaction hash",
      value: "<mixed path-payment + change_trust hash>"
    },
    { action: "click", target: "Reconcile receipt" },
    { action: "expect", target: "text", value: "Path payment (strict send)" },
    { action: "expect", target: "text", value: "Outside this receipt" },
    { action: "expect", target: "text", value: "change trust" },
    { action: "expect", target: "text", value: "trade" },
    { action: "expect", target: "text", value: "Exact totals" }
  ]
} as const;
