/**
 * End-to-end specification for the Account Offers Inspector tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/offer-inspector",
  steps: [
    { action: "visit", target: "/tools/offer-inspector" },
    { action: "expect", target: "heading", value: "Account Offers Inspector" },
    { action: "fill", target: "Account address", value: "<funded testnet G address>" },
    { action: "click", target: "Inspect offers" },
    { action: "expect", target: "table" },
    { action: "expect", target: "text", value: "Gross Reserve Requirements" },
    { action: "switchNetwork", value: "mainnet" },
    { action: "expect", target: "text", value: "Inspect Stellar DEX Offers" }
  ]
} as const;

