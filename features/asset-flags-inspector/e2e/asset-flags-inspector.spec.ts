/**
 * End-to-end specification for the Issuer Authorization Flags Inspector tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/asset-flags-inspector",
  steps: [
    { action: "visit", target: "/tools/asset-flags-inspector" },
    { action: "expect", target: "heading", value: "Issuer Authorization Flags Inspector" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
