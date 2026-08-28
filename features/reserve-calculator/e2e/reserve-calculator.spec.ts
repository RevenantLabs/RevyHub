/**
 * End-to-end specification for the Minimum Balance and Reserve Calculator tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/reserve-calculator",
  steps: [
    { action: "visit", target: "/tools/reserve-calculator" },
    { action: "expect", target: "heading", value: "Minimum Balance and Reserve Calculator" },
    { action: "fill", target: "Account address", value: "a funded public G-address" },
    { action: "click", target: "Calculate reserve" },
    { action: "expect", target: "heading", value: "Reserve summary" },
    { action: "expect", target: "text", value: "Spendable balance" },
    { action: "expect", target: "text", value: "Minimum balance breakdown" },
    { action: "expect", target: "text", value: "Source ledger" }
  ]
} as const;
