/**
 * End-to-end specification for the Claimable Balance Explorer tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/claimable-balances",
  steps: [
    { action: "visit", target: "/tools/claimable-balances" },
    { action: "expect", target: "heading", value: "Claimable Balance Explorer" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
