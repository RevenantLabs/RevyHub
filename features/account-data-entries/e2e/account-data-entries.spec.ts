/**
 * End-to-end specification for the Account Data Entry Viewer tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/account-data-entries",
  steps: [
    { action: "visit", target: "/tools/account-data-entries" },
    { action: "expect", target: "heading", value: "Account Data Entry Viewer" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
