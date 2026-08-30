/**
 * End-to-end specification for the Transaction Result Code Explainer tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/result-code-explainer",
  steps: [
    { action: "visit", target: "/tools/result-code-explainer" },
    { action: "expect", target: "heading", value: "Transaction Result Code Explainer" },
    { action: "fill", target: "textarea", value: "payment_underfunded" },
    { action: "click", target: "submit" },
    { action: "expect", target: "text", value: "Payment source lacks balance" },
    { action: "select", target: "radio", value: "Result XDR" },
    { action: "fill", target: "textarea", value: "AAAAAAAAAGT/////AAAAAQAAAAAAAAAB/////gAAAAA=" },
    { action: "click", target: "submit" },
    { action: "expect", target: "text", value: "tx_failed" }
  ]
} as const;
