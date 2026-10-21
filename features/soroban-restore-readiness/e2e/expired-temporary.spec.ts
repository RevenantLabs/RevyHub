/**
 * Edge-case end-to-end specification: a temporary entry past its live-until
 * ledger. Distinct from the main spec because the expected outcome is a
 * "not restorable" result, not an error.
 */
export const spec = {
  route: "/tools/soroban-restore-readiness",
  steps: [
    { action: "visit", target: "/tools/soroban-restore-readiness" },
    { action: "fill", target: "Contract ID", value: "expired temporary entry fixture" },
    { action: "fill", target: "Storage key (ScVal, base64 XDR)", value: "expired temporary entry fixture" },
    { action: "select", target: "Durability", value: "Temporary" },
    { action: "click", target: "Check readiness" },
    { action: "expect", target: "an 'Expired and deleted' notice stating the entry is not restorable" }
  ]
} as const;
