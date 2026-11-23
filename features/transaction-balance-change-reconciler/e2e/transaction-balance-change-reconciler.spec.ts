export const spec = {
  route: "/tools/transaction-balance-change-reconciler",
  steps: [
    { action: "visit", target: "/tools/transaction-balance-change-reconciler" },
    { action: "expect", target: "heading", value: "Transaction Balance Change Reconciler" },
    { action: "expect", target: "text", value: "Nothing reconciled yet" },

    // Normal payment reconciles with zero residual.
    { action: "fill", target: "Transaction envelope XDR", value: "<base64 classic envelope>" },
    { action: "fill", target: "Transaction result XDR", value: "<base64 result fee 100>" },
    { action: "fill", target: "Transaction metadata XDR", value: "<base64 meta v2 payment>" },
    { action: "select", target: "Network passphrase", value: "Testnet" },
    { action: "click", target: "Reconcile balances" },
    { action: "expect", target: "text", value: "Balances reconcile" },
    { action: "expect", target: "text", value: "Balance deltas" },

    // Unexplained residual surfaces incomplete evidence.
    { action: "fill", target: "Transaction result XDR", value: "<base64 result fee 1>" },
    { action: "click", target: "Reconcile balances" },
    { action: "expect", target: "status", value: "Evidence is incomplete" },
    { action: "expect", target: "text", value: "Unexplained" },

    // Malformed metadata is an error, not a silent empty success.
    { action: "fill", target: "Transaction metadata XDR", value: "not base64 at all" },
    { action: "click", target: "Reconcile balances" },
    { action: "expect", target: "alert", value: "The XDR could not be decoded" },

    { action: "expectNoRequest", target: "network" }
  ]
} as const;
