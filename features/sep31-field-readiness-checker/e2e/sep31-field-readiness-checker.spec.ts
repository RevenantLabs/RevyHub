export const spec = {
  route: "/tools/sep31-field-readiness-checker",
  offline: true,
  steps: [
    { action: "visit", target: "/tools/sep31-field-readiness-checker" },
    { action: "expect", target: "heading", value: "SEP-31 Transfer Field Readiness Checker" },
    { action: "fill", target: "Anchor identifier", value: "anchor-demo" },
    { action: "fill", target: "Asset code", value: "USDC" },
    { action: "fill", target: "Field requirement JSON", value: "{\"fields\":{}}" },
    { action: "fill", target: "Local field map JSON", value: "{}" },
    { action: "click", target: "Check readiness" },
    { action: "expect", target: "status-or-result" }
  ]
} as const
