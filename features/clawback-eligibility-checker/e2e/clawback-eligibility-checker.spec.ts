/**
 * End-to-end specification for the Clawback Eligibility Checker tool.
 * Documented as executable steps — see `features/trustline-checker/e2e` for
 * the established format this follows.
 */
export const spec = {
  route: "/tools/clawback-eligibility-checker",
  steps: [
    { action: "visit", target: "/tools/clawback-eligibility-checker" },
    { action: "fill", target: "Issuer account", value: "eligible issuer fixture" },
    { action: "fill", target: "Holder account", value: "eligible holder fixture" },
    { action: "fill", target: "Asset code", value: "eligible asset code fixture" },
    { action: "click", target: "Check eligibility" },
    { action: "expect", target: "issuer signal true, holder signal true, verdict Clawback-eligible" },
    { action: "click", target: "Reset" },
    { action: "expect", target: "idle state and cleared fields" }
  ]
} as const;
