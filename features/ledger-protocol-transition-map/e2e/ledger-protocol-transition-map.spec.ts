export const spec = {
  route: "/tools/ledger-protocol-transition-map",
  steps: [
    { action: "visit", target: "/tools/ledger-protocol-transition-map" },
    { action: "expect", target: "heading", value: "Ledger Protocol Transition Map" },
    { action: "expect", target: "text", value: "No protocol map yet" },
    { action: "fill", target: "Start ledger", value: "1000" },
    { action: "fill", target: "Ledger count", value: "4" },
    { action: "click", target: "Map protocol transitions" },
    { action: "expect", target: "text", value: "Protocol version runs" },
    { action: "expect", target: "text", value: "Exact" },
    { action: "switchNetwork", value: "mainnet" },
    { action: "expect", target: "text", value: "No protocol map yet" }
  ]
} as const;
