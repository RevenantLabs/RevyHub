/**
 * End-to-end specification for the Soroban Authorization Entry Inspector tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/soroban-auth-inspector",
  steps: [
    { action: "visit", target: "/tools/soroban-auth-inspector" },
    { action: "expect", target: "heading", value: "Soroban Authorization Entry Inspector" },
    { action: "type", target: "Transaction envelope XDR", value: "AAAA..." },
    { action: "click", target: "Inspect authorization" },
    { action: "expect", target: "heading", value: "Authorization entries" }
  ]
} as const;
