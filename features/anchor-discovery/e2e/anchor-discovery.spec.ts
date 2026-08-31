/**
 * End-to-end specification for the Anchor Endpoint Discovery tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/anchor-discovery",
  steps: [
    { action: "visit", target: "/tools/anchor-discovery" },
    { action: "expect", target: "heading", value: "Anchor Endpoint Discovery" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
