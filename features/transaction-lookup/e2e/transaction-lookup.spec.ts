export const spec = {
  route: "/tools/transaction-lookup",
  steps: [
    { action: "visit", target: "/tools/transaction-lookup" },
    { action: "expect", target: "heading", value: "Transaction Lookup" },
    { action: "fill", target: "Transaction hash", value: "<64 hex characters>" },
    { action: "click", target: "Look up transaction" },
    { action: "expect", target: "status", value: "This transaction succeeded" },
    { action: "expect", target: "list", value: "Operations" },
    { action: "switchNetwork", value: "mainnet" },
    { action: "expect", target: "text", value: "No transaction looked up yet" }
  ]
} as const;
