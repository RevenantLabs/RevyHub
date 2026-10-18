export const spec = {
  route: "/tools/ledger-close-cadence",
  steps: [
    { action: "visit", target: "/tools/ledger-close-cadence" },
    { action: "expect", target: "heading", value: "Ledger Close Cadence Explorer" },
    { action: "expect", target: "text", value: "No cadence sample yet" },
    { action: "fill", target: "Sample size", value: "4" },
    { action: "click", target: "Measure close cadence" },
    { action: "expect", target: "text", value: "Sample summary" },
    { action: "expect", target: "text", value: "Adjacent close intervals" },
    { action: "switchNetwork", value: "mainnet" },
    { action: "expect", target: "text", value: "No cadence sample yet" }
  ]
} as const;
