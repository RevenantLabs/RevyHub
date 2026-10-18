export const spec = {
  route: "/tools/ledger-close-cadence",
  steps: [
    { action: "visit", target: "/tools/ledger-close-cadence" },
    { action: "switchNetwork", value: "mainnet" },
    { action: "fill", target: "Sample size", value: "4" },
    { action: "click", target: "Measure close cadence" },
    { action: "expect", target: "text", value: "Sequence gaps" },
    { action: "expect", target: "text", value: "Missing sequences" }
  ]
} as const;
