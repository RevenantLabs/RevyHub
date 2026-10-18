export const spec = {
  route: "/tools/trustline-checker",
  steps: [
    { action: "visit", target: "/tools/trustline-checker" },
    { action: "expect", target: "heading", value: "Trustline Checker" },
    { action: "fill", target: "Account address", value: "<G address holding USDC>" },
    { action: "fill", target: "Asset code", value: "USDC" },
    { action: "fill", target: "Issuer address", value: "<USDC issuer>" },
    { action: "click", target: "Check trustline" },
    { action: "expect", target: "status", value: "Trustline found" },
    { action: "fill", target: "Issuer address", value: "<unrelated G address>" },
    { action: "click", target: "Check trustline" },
    { action: "expect", target: "status", value: "No trustline for this asset and issuer" }
  ]
} as const;
