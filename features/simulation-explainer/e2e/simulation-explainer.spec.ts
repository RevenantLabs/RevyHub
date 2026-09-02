/**
 * End-to-end specification for the Soroban Simulation Result Explainer tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/simulation-explainer",
  steps: [
    { action: "visit", target: "/tools/simulation-explainer" },
    { action: "expect", target: "heading", value: "Soroban Simulation Result Explainer" },
    { action: "type", target: "Transaction envelope XDR", value: "AAAA..." },
    { action: "click", target: "Simulate transaction" },
    { action: "expect", target: "heading", value: "Simulation result" }
  ]
} as const;
