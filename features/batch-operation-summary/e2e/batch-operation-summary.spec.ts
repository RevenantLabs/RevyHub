/**
 * End-to-end specification for the Batch Operation Summary tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/batch-operation-summary",
  steps: [
    { action: "visit", target: "/tools/batch-operation-summary" },
    { action: "expect", target: "heading", value: "Batch Operation Summary" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
