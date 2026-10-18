export const spec = {
  route: "/tools/sep7-request-policy-auditor",
  steps: [
    { action: "visit", target: "/tools/sep7-request-policy-auditor" },
    { action: "fill", target: "SEP-0007 URI and local policy JSON", value: "sample pay request" },
    { action: "click", target: "Audit request" },
    { action: "expect", target: "every rule passes and the verdict is copyable" },
    { action: "click", target: "Reset" },
    { action: "expect", target: "idle state and cleared fields" }
  ]
} as const;
