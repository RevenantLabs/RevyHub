export const spec = {
  route: "/tools/contract-events",
  steps: [
    { action: "visit", target: "/tools/contract-events" },
    { action: "expect", target: "heading", value: "Soroban Contract Event Viewer" },
    { action: "fill", target: "Contract ID", value: "<Soroban contract ID>" },
    { action: "fill", target: "Start ledger", value: "1000000" },
    { action: "fill", target: "End ledger", value: "1000100" },
    { action: "click", target: "Fetch events" },
    { action: "expect", target: "status", value: "events found" },
    { action: "switchNetwork", value: "mainnet" },
    { action: "expect", target: "text", value: "No events fetched yet" }
  ]
} as const;
