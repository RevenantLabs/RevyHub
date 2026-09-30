/**
 * End-to-end specification for the Operation Budget Planner tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/operation-budget-planner",
  steps: [
    { action: "visit", target: "/tools/operation-budget-planner" },
    { action: "expect", target: "heading", value: "Operation Budget Planner" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
