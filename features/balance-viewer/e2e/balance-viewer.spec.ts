export const spec = {
  route: "/tools/balance-viewer",
  steps: [
    { action: "visit", target: "/tools/balance-viewer" },
    { action: "expect", target: "heading", value: "Balance Viewer" },
    { action: "fill", target: "Account address", value: "<funded testnet G address>" },
    { action: "click", target: "Load balances" },
    { action: "expect", target: "table" },
    { action: "expect", target: "rowheader", value: "XLM (native)" },
    { action: "switchNetwork", value: "mainnet" },
    { action: "expect", target: "text", value: "No account loaded yet" }
  ]
} as const;
