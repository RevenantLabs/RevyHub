/**
 * End-to-end specification for the Account Merge Preflight Check tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/account-merge-preflight",
  steps: [
    { action: "visit", target: "/tools/account-merge-preflight" },
    { action: "expect", target: "heading", value: "Account Merge Preflight Check" },
    { action: "selectNetwork", target: "network", value: "Testnet" },
    { action: "fill", target: "Source account", value: "<fixture source G-address>" },
    { action: "fill", target: "Destination account", value: "<fixture destination G-address>" },
    { action: "click", target: "Run merge preflight" },
    { action: "expect", target: "Account is mergeable" },
    { action: "expectExact", target: "Current XLM that would transfer", value: "25.5000000 XLM" },
    { action: "expectCount", target: "Pass", value: 8 },
    { action: "repeatWith", target: "fixture", value: "blocked source" },
    { action: "expect", target: "Account is not mergeable yet" },
    { action: "expect", target: "Concrete blockers", value: "trustline, offer, data, sponsorship and signer details" },
    { action: "repeatWith", target: "Destination account", value: "<same as source>" },
    { action: "expect", target: "alert", value: "Choose a different destination" }
  ]
} as const;
