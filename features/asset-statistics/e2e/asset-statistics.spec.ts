/**
 * End-to-end specification for the Asset Supply and Holder Statistics tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/asset-statistics",
  steps: [
    { action: "visit", target: "/tools/asset-statistics" },
    { action: "expect", target: "heading", value: "Asset Supply and Holder Statistics" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
