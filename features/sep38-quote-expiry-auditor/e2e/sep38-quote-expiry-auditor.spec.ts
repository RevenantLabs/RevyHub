export const spec = {
  route: "/tools/sep38-quote-expiry-auditor",
  offline: true,
  steps: [
    { action: "visit", target: "/tools/sep38-quote-expiry-auditor" },
    { action: "expect", target: "heading", value: "SEP-38 Quote Expiry and Terms Auditor" },
    { action: "fill", target: "Anchor identifier", value: "anchor-demo" },
    { action: "fill", target: "Evaluation time", value: "2026-06-01T12:00:00.000Z" },
    { action: "fill", target: "SEP-38 quote JSON", value: "{\"id\":\"quote-100\"}" },
    { action: "click", target: "Audit quote" },
    { action: "expect", target: "status-or-alert" }
  ]
} as const
