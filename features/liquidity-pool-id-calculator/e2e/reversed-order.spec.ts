/**
 * Edge-case end-to-end specification: the same two assets as the main spec,
 * entered in the opposite order (native first, USDC second — already in
 * canonical order). Distinct from the main spec because the expected
 * outcome is the identical pool ID, with `swapped: false` shown this time,
 * versus `swapped: true` when USDC is entered first.
 */
export const spec = {
  route: "/tools/liquidity-pool-id-calculator",
  steps: [
    { action: "visit", target: "/tools/liquidity-pool-id-calculator" },
    { action: "fill", target: "Asset 1 code", value: "the native asset (left blank)" },
    { action: "fill", target: "Asset 2 code", value: "USDC fixture" },
    { action: "fill", target: "Asset 2 issuer", value: "issuer fixture" },
    { action: "click", target: "Compute pool ID" },
    { action: "expect", target: "the same pool ID as the main spec, with swapped: false since this order was already canonical" }
  ]
} as const;
