/**
 * End-to-end specification for the Testnet and Mainnet Comparison tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/network-comparison",
  steps: [
    { action: "visit", target: "/tools/network-comparison" },
    { action: "expect", target: "heading", value: "Testnet and Mainnet Comparison" },
    { action: "expect", target: "text", value: "No comparison data loaded" },
    { action: "click", target: "Compare networks" },
    { action: "expect", target: "text", value: "Protocol difference" },
    { action: "expect", target: "text", value: "Testnet" },
    { action: "expect", target: "text", value: "Mainnet" },
    { action: "expect", target: "text", value: "About Testnet periodic resets" }
  ]
} as const;
