export const spec = {
  route: "/tools/transaction-fee-charge-audit",
  steps: [
    { action: "visit", target: "/tools/transaction-fee-charge-audit" },
    { action: "expect", target: "heading", value: "Transaction Fee Charge Audit" },
    { action: "fill", target: "Transaction hash", value: "<64 hex characters>" },
    { action: "click", target: "Audit fees" },
    { action: "expect", target: "status", value: "Fee charge audit" },
    { action: "expect", target: "text", value: "Offered versus charged" },
    { action: "expect", target: "text", value: "Unused fee (offered − charged)" },
    { action: "switchNetwork", value: "mainnet" },
    { action: "expect", target: "text", value: "No fee charge audited yet" }
  ]
} as const;
