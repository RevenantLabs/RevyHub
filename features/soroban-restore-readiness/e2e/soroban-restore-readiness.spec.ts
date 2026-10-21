/**
 * End-to-end specification for the Soroban Storage Restore Readiness tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI — see `features/contract-code-hash-verifier/e2e`
 * for the established format this follows.
 */
export const spec = {
  route: "/tools/soroban-restore-readiness",
  steps: [
    { action: "visit", target: "/tools/soroban-restore-readiness" },
    { action: "fill", target: "Contract ID", value: "live entry fixture" },
    { action: "fill", target: "Storage key (ScVal, base64 XDR)", value: "live entry fixture" },
    { action: "click", target: "Check readiness" },
    { action: "expect", target: "a Live badge, the current ledger, and the live-until ledger" },
    { action: "click", target: "Reset" },
    { action: "expect", target: "idle state and cleared fields" }
  ]
} as const;
