export const spec = {
  route: "/tools/account-merge-value-reconciler",
  steps: [
    { action: "visit", target: "/tools/account-merge-value-reconciler" },
    { action: "expect", target: "heading", value: "Account Merge Value Reconciler" },
    { action: "expect", target: "text", value: "No transaction checked yet" },

    // Two merges with paired metadata reconcile completely.
    { action: "fill", target: "Transaction envelope XDR", value: "<normal.fixture envelope>" },
    { action: "fill", target: "Transaction result XDR", value: "<normal.fixture result XDR>" },
    { action: "fill", target: "Transaction metadata XDR", value: "<normal.fixture metadata XDR>" },
    { action: "click", target: "Reconcile value" },
    { action: "expect", target: "status", value: "Evidence aligned" },
    { action: "expect", target: "text", value: "Merge operations" },
    { action: "expect", target: "text", value: "3.0000003" },

    // A fee-bump payer is shown apart from the merge sources.
    { action: "fill", target: "Transaction envelope XDR", value: "<boundary.fixture fee-bump envelope>" },
    { action: "fill", target: "Transaction result XDR", value: "<boundary.fixture fee-bump result XDR>" },
    { action: "click", target: "Reconcile value" },
    { action: "expect", target: "text", value: "Fee payer" },

    // Missing metadata is incomplete evidence, not a zero.
    { action: "fill", target: "Transaction metadata XDR", value: "" },
    { action: "click", target: "Reconcile value" },
    { action: "expect", target: "status", value: "Incomplete evidence" },
    { action: "expect", target: "text", value: "Evidence gaps" },

    // A failed transaction shows rolled-back and failed merges.
    { action: "fill", target: "Transaction envelope XDR", value: "<normal.fixture envelope>" },
    { action: "fill", target: "Transaction result XDR", value: "<boundary.fixture failed result XDR>" },
    { action: "click", target: "Reconcile value" },
    { action: "expect", target: "text", value: "Failed — nothing transferred" },

    // Invalid input is announced as an alert.
    { action: "fill", target: "Transaction result XDR", value: "not XDR" },
    { action: "click", target: "Reconcile value" },
    { action: "expect", target: "alert", value: "Invalid input" },

    { action: "expectNoRequest", target: "network" }
  ]
} as const;
