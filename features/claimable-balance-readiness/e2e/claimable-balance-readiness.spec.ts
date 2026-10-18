/**
 * End-to-end specification for Claimable Balance Claim Readiness.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/claimable-balance-readiness",
  steps: [
    { action: "visit", target: "/tools/claimable-balance-readiness" },
    { action: "expect", target: "heading", value: "Claimable Balance Claim Readiness" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" },
    { action: "type", target: "balance ID", value: "valid-64-hex" },
    { action: "type", target: "claimant", value: "G..." },
    { action: "type", target: "evaluation time", value: "2026-06-01T12:00:00Z" },
    { action: "click", target: "submit" },
    { action: "expect", target: "verdict" }
  ]
} as const;
