/**
 * End-to-end specification for the Sequence Number Inspector tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/sequence-inspector",
  steps: [
    { action: "visit", target: "/tools/sequence-inspector" },
    { action: "expect", target: "heading", value: "Sequence Number Inspector" },
    { action: "selectNetwork", target: "network", value: "Testnet" },
    { action: "fill", target: "Stellar account address", value: "<fixture public G-address>" },
    { action: "fill", target: "Bump target (optional)", value: "<fixture valid int64 target>" },
    { action: "click", target: "Inspect sequence" },
    { action: "expect", target: "Sequence details" },
    { action: "expectExact", target: "Current sequence", value: "<fixture exact digits>" },
    { action: "expectExact", target: "Next valid transaction sequence", value: "<fixture current + 1>" },
    { action: "click", target: "Copy next sequence" },
    { action: "expectClipboard", target: "clipboard", value: "<fixture current + 1>" },
    { action: "expect", target: "Bump-sequence effect" },
    { action: "expect", target: "Why tx_bad_seq happens" }
  ]
} as const;
