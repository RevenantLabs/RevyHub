export const spec = {
  route: "/tools/horizon-rate-limit-monitor",
  fixture: "missing-headers",
  steps: [
    { action: "visit", target: "/tools/horizon-rate-limit-monitor" },
    { action: "click", target: "Check rate limits" },
    { action: "expect", target: "table", value: "Endpoint quotas" },
    { action: "expect", target: "text", value: "Not reported" }
  ]
} as const;
