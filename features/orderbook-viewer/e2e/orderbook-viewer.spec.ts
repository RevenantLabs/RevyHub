/**
 * End-to-end specification for the Order Book Viewer tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/orderbook-viewer",
  steps: [
    { action: "visit", target: "/tools/orderbook-viewer" },
    { action: "expect", target: "heading", value: "Order Book Viewer" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
