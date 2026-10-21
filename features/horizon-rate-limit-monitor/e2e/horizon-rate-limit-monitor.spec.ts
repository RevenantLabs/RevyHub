export const spec = {
  route: "/tools/horizon-rate-limit-monitor",
  steps: [
    { action: "visit", target: "/tools/horizon-rate-limit-monitor" },
    { action: "expect", target: "heading", value: "Horizon Rate Limit Monitor" },
    { action: "expect", target: "text", value: "No rate limits checked yet" },
    { action: "fill", target: "Low quota threshold", value: "10" },
    { action: "click", target: "Check rate limits" },
    { action: "expect", target: "table", value: "Endpoint quotas" },
    { action: "expect", target: "text", value: "Reset countdown" },
    { action: "switchNetwork", value: "mainnet" },
    { action: "expect", target: "text", value: "No rate limits checked yet" }
  ]
} as const;
