/** Reviewable browser specification; the repository does not configure an E2E runner. */
export const spec = {
  route: "/tools/soroban-event-filter-composer",
  steps: [
    { action: "visit", target: "/tools/soroban-event-filter-composer" },
    { action: "submit", target: "empty form" },
    { action: "expect", target: "invalid contract ID guidance" },
    { action: "fill", target: "form", value: "deterministic contract ID, sym:transfer topic and start ledger 150" },
    { action: "click", target: "Run filter" },
    { action: "expect", target: "decoded topic, retention window and the exact getEvents JSON" },
    { action: "click", target: "Reset" },
    { action: "expect", target: "idle state" }
  ]
} as const;
