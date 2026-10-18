/**
 * End-to-end specification for the Liquidity Pool Inspector tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/liquidity-pool-inspector",
  steps: [
    { action: "visit", target: "/tools/liquidity-pool-inspector" },
    { action: "expect", target: "heading", value: "Liquidity Pool Inspector" },
    {
      action: "type",
      target: "Liquidity pool ID",
      value: "dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7"
    },
    { action: "click", target: "Inspect pool" },
    { action: "expect", target: "text", value: "30 bps (0.30%)" },
    { action: "expect", target: "text", value: "1 XLM ≈ 0.25 USDC" }
  ]
} as const;
