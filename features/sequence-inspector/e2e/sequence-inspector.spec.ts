export const spec = {
  route: "/tools/sequence-inspector",
  steps: [
    { action: "visit", target: "/tools/sequence-inspector" },
    { action: "expect", target: "heading", value: "Sequence Number Inspector" },
    { action: "fill", target: "Account address", value: "G..." },
    { action: "click", target: "Inspect sequence" },
    { action: "expect", target: "heading", value: "Sequence Details" },
    { action: "switchNetwork", value: "mainnet" },
    { action: "expect", target: "text", value: "Sequence Number Inspector" }
  ]
} as const;
