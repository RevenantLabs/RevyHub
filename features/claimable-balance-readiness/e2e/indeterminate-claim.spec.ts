/**
 * Edge-case browser journey: relative predicates without creation context
 * must surface an indeterminate verdict, never a false yes/no.
 */
export const spec = {
  route: "/tools/claimable-balance-readiness",
  steps: [
    { action: "visit", target: "/tools/claimable-balance-readiness" },
    {
      action: "type",
      target: "balance ID",
      value: "balance-without-last_modified_time"
    },
    { action: "type", target: "claimant", value: "G...listed-claimant" },
    { action: "type", target: "evaluation time", value: "2026-06-01T12:00:00Z" },
    { action: "click", target: "submit" },
    { action: "expect", target: "verdict", value: "Indeterminate" },
    {
      action: "expect",
      target: "creation context",
      value: "Unavailable — relative predicates cannot be decided reliably"
    }
  ]
} as const;
