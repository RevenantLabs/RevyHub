export const spec = {
  route: "/tools/transaction-fee-charge-audit",
  steps: [
    { action: "visit", target: "/tools/transaction-fee-charge-audit" },
    { action: "expect", target: "heading", value: "Transaction Fee Charge Audit" },
    {
      action: "fill",
      target: "Transaction hash",
      value: "<64 hex characters of a settled fee-bump transaction>"
    },
    { action: "click", target: "Audit fees" },
    { action: "expect", target: "text", value: "Fee-bump" },
    { action: "expect", target: "text", value: "Outer fee source" },
    { action: "expect", target: "text", value: "Inner fee bid" },
    {
      action: "expect",
      target: "text",
      value:
        "A fee-bump envelope separates the outer fee source (who paid) from the inner transaction source (whose operations ran)."
    }
  ]
} as const;
