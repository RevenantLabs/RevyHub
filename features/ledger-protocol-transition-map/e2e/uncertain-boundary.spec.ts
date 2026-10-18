export const spec = {
  route: "/tools/ledger-protocol-transition-map",
  steps: [
    { action: "visit", target: "/tools/ledger-protocol-transition-map" },
    { action: "switchNetwork", value: "mainnet" },
    { action: "fill", target: "Start ledger", value: "2000" },
    { action: "fill", target: "Ledger count", value: "4" },
    { action: "click", target: "Map protocol transitions" },
    { action: "expect", target: "text", value: "Uncertain" },
    { action: "expect", target: "text", value: "Gaps and uncertain boundaries" }
  ]
} as const;
