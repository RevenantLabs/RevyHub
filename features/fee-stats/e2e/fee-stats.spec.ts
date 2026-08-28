export const spec = {
  route: "/tools/fee-stats",
  steps: [
    { action: "visit", target: "/tools/fee-stats" },
    { action: "expect", target: "heading", value: "Network Fee Statistics" },
    { action: "expect", target: "text", value: "No fee statistics loaded yet" },
    { action: "click", target: "Load fee statistics" },
    { action: "expect", target: "table", value: "Fees actually charged" },
    { action: "expect", target: "table", value: "Fees offered (max fee)" },
    { action: "expect", target: "text", value: "Suggested fee" },
    { action: "switchNetwork", value: "mainnet" },
    { action: "expect", target: "text", value: "No fee statistics loaded yet" }
  ]
} as const;
