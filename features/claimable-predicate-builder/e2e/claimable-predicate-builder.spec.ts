/**
 * End-to-end specification for the Claimable Balance Predicate Builder tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/claimable-predicate-builder",
  steps: [
    { action: "visit", target: "/tools/claimable-predicate-builder" },
    { action: "expect", target: "heading", value: "Claimable Balance Predicate Builder" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
