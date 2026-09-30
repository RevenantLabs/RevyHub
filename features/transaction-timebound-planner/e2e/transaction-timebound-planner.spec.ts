/**
 * End-to-end specification for the Transaction Timebound Planner tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/transaction-timebound-planner",
  steps: [
    { action: "visit", target: "/tools/transaction-timebound-planner" },
    { action: "expect", target: "heading", value: "Transaction Timebound Planner" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
