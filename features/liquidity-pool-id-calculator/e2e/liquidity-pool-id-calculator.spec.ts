/**
 * End-to-end specification for the Liquidity Pool ID Calculator tool.
 * Documented as executable steps — see `features/xdr-inspector/e2e` for the
 * established format this follows.
 */
export const spec = {
  route: "/tools/liquidity-pool-id-calculator",
  steps: [
    { action: "visit", target: "/tools/liquidity-pool-id-calculator" },
    { action: "fill", target: "Asset 1 code", value: "USDC fixture" },
    { action: "fill", target: "Asset 1 issuer", value: "issuer fixture" },
    { action: "click", target: "Compute pool ID" },
    { action: "expect", target: "a 64-character hex pool ID and the canonical A/B ordering" },
    { action: "click", target: "Reset" },
    { action: "expect", target: "idle state and cleared fields" }
  ]
} as const;
