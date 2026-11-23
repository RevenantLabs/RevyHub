export const spec = {
  route: "/tools/sep6-capability-evidence-auditor",
  offline: true,
  steps: [
    { action: "visit", target: "/tools/sep6-capability-evidence-auditor" },
    { action: "expect", target: "heading", value: "SEP-6 Capability Evidence Auditor" },
    { action: "fill", target: "Anchor URL", value: "https://anchor.example" },
    { action: "fill", target: "SEP-6 /info JSON", value: "{}" },
    { action: "click", target: "Audit capabilities" },
    { action: "expect", target: "status" }
  ]
} as const
