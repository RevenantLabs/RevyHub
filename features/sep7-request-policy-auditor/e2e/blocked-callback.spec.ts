export const spec = {
  route: "/tools/sep7-request-policy-auditor",
  steps: [
    { action: "visit", target: "/tools/sep7-request-policy-auditor" },
    { action: "fill", target: "a pay URI whose callback host is not on the allowlist", value: "blocked callback fixture" },
    { action: "click", target: "Audit request" },
    { action: "expect", target: "callback fails and the URL is shown as text" }
  ]
} as const;
