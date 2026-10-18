/**
 * End-to-end specification for the Operation History Browser tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/operation-browser",
  steps: [
    { action: "visit", target: "/tools/operation-browser" },
    { action: "expect", target: "heading", value: "Operation History Browser" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
