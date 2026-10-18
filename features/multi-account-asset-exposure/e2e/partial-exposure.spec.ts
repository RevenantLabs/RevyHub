/** A missing account remains visible and has an empty CSV cell. */
export const spec = {
  route: "/tools/multi-account-asset-exposure",
  steps: [
    { action: "visit", target: "/tools/multi-account-asset-exposure" },
    { action: "fill", target: "Public account addresses", value: "<funded G address, missing G address, funded G address>" },
    { action: "click", target: "Compare balances" },
    { action: "expect", target: "text", value: "Account not found" },
    { action: "expect", target: "text", value: "Totals include successful accounts only" },
    { action: "expect", target: "table", value: "Successful rows and empty failed-account cells" }
  ]
} as const;
