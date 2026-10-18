/**
 * End-to-end specification for the SEP-10 Challenge Transaction Inspector tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/sep10-inspector",
  steps: [
    { action: "visit", target: "/tools/sep10-inspector" },
    { action: "expect", target: "heading", value: "SEP-10 Challenge Transaction Inspector" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
