/**
 * End-to-end specification for the Trade Aggregation Viewer tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/trade-aggregation-viewer",
  steps: [
    { action: "visit", target: "/tools/trade-aggregation-viewer" },
    { action: "expect", target: "heading", value: "Trade Aggregation Viewer" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
