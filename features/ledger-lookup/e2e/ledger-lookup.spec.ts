/**
 * End-to-end specification for the Ledger Lookup tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/ledger-lookup",
  steps: [
    { action: "visit", target: "/tools/ledger-lookup" },
    { action: "expect", target: "heading", value: "Ledger Lookup" },
    { action: "fill", target: "input", value: "50000000" },
    { action: "click", target: "submit" },
    { action: "expect", target: "text", value: "#50,000,000" },
    { action: "expect", target: "text", value: "Successful transactions" },
    { action: "expect", target: "text", value: "Fee pool" },
    { action: "expect", target: "text", value: "Base fee" },
    { action: "expect", target: "text", value: "Base reserve" }
  ]
} as const;
