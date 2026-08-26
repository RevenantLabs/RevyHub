/**
 * End-to-end specification for the Sponsored Reserves Inspector tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/sponsored-reserves",
  steps: [
    { action: "visit", target: "/tools/sponsored-reserves" },
    { action: "expect", target: "heading", value: "Sponsored Reserves Inspector" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
