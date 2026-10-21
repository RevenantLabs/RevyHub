/**
 * Main browser journey for the Reserve Capacity Planner.
 * The repository runner looks in tests/e2e, so this file records the journey
 * the panel tests also exercise.
 */
export const spec = {
  route: "/tools/reserve-capacity-planner",
  offline: true,
  steps: [
    { action: "visit", target: "/tools/reserve-capacity-planner" },
    { action: "expect", target: "heading", value: "Reserve Capacity Planner" },
    { action: "expect", target: "empty state", value: "No reserve projected yet" },
    { action: "resize", target: "viewport", value: "390x844" },
    { action: "expect", target: "single column form" },
    { action: "click", target: "Project reserve" },
    { action: "expect", target: "alert", value: "Enter trustlines as a whole number that is zero or greater." },
    { action: "fill", target: "Trustlines", value: "1" },
    { action: "fill", target: "Offers", value: "2" },
    { action: "fill", target: "Data entries", value: "3" },
    { action: "fill", target: "Signer subentries", value: "4" },
    { action: "fill", target: "Starting balance (XLM)", value: "10" },
    { action: "leave blank", target: "Base reserve override (XLM)" },
    { action: "click", target: "Project reserve" },
    { action: "expect", target: "local processing status", value: "Projecting reserve locally..." },
    {
      action: "expect",
      target: "formula",
      value: "Minimum balance = 0.5 XLM × (2 + 10) = 6 XLM"
    },
    { action: "expect", target: "stroops", value: "5,000,000 stroops × (2 + 10) = 60,000,000 stroops" },
    { action: "expect", target: "spendable", value: "4 XLM" },
    { action: "expect", target: "network requests", value: "none" },
    { action: "click", target: "Reset" },
    { action: "expect", target: "empty state" }
  ]
} as const;
