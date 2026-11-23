/**
 * End-to-end specification for the Transaction Sequence Gap Auditor tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/transaction-sequence-gap-auditor",
  steps: [
    { action: "visit", target: "/tools/transaction-sequence-gap-auditor" },
    { action: "expect", target: "heading", value: "Transaction Sequence Gap Auditor" },
    { action: "fill", target: "Stellar account", value: "valid public G-address" },
    { action: "click", target: "Audit sequence history" },
    { action: "expect", target: "heading", value: "Gap overview" },
    { action: "expect", target: "heading", value: "History coverage" },
    { action: "expect", target: "heading", value: "Sequence gaps" },
    { action: "reload", target: "/tools/transaction-sequence-gap-auditor" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert", value: "Enter a valid public G-address" }
  ]
} as const;
