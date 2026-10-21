/**
 * Edge-case end-to-end specification: the issuer and holder clawback flags
 * disagree. Distinct from the main spec because the expected outcome is an
 * explicit disagreement notice, not an inferred verdict.
 */
export const spec = {
  route: "/tools/clawback-eligibility-checker",
  steps: [
    { action: "visit", target: "/tools/clawback-eligibility-checker" },
    { action: "fill", target: "Issuer account", value: "disagreeing issuer fixture" },
    { action: "fill", target: "Holder account", value: "disagreeing holder fixture" },
    { action: "fill", target: "Asset code", value: "disagreeing asset code fixture" },
    { action: "click", target: "Check eligibility" },
    { action: "expect", target: "a 'Signals disagree' verdict naming both the issuer and holder flag values" }
  ]
} as const;
