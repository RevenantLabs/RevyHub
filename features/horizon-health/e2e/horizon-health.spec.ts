export const spec = {
  route: "/tools/horizon-health",
  steps: [
    { action: "visit", target: "/tools/horizon-health" },
    { action: "expect", target: "heading", value: "Horizon Endpoint Health Diagnostic" },
    { action: "expect", target: "text", value: "Diagnostic not run yet" },
    { action: "click", target: "Run diagnostic" },
    { action: "expect", target: "text", value: "Horizon is healthy and in sync" },
    { action: "expect", target: "text", value: "Horizon Endpoint Diagnostic" },
    { action: "switchNetwork", value: "mainnet" },
    { action: "expect", target: "text", value: "Diagnostic not run yet" }
  ]
} as const;
