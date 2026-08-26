/**
 * End-to-end specification for the Account Merge Preflight Check tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/account-merge-preflight",
  steps: [
    { action: "visit", target: "/tools/account-merge-preflight" },
    { action: "expect", target: "heading", value: "Account Merge Preflight Check" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
