/** Browser journey specification; the route is registry-generated. */
export const spec = {
  route: "/tools/multi-account-asset-exposure",
  steps: [
    { action: "visit", target: "/tools/multi-account-asset-exposure" },
    { action: "expect", target: "heading", value: "Multi-Account Asset Exposure Matrix" },
    { action: "fill", target: "Public account addresses", value: "<two funded testnet G addresses, one per line>" },
    { action: "click", target: "Compare balances" },
    { action: "expect", target: "table", value: "Asset by account" },
    { action: "expect", target: "row", value: "USD from two issuers on separate rows" },
    { action: "click", target: "Download public CSV" },
    { action: "expect", target: "download", value: "asset-exposure.csv" }
  ]
} as const;
