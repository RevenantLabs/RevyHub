/**
 * End-to-end specification for the Path Payment Slippage Calculator tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/path-payment-slippage-calculator",
  steps: [
    { action: "visit", target: "/tools/path-payment-slippage-calculator" },
    { action: "expect", target: "heading", value: "Path Payment Slippage Calculator" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
