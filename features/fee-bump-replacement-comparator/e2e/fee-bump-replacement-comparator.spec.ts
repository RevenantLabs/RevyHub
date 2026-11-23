export const spec = {
  route: "/tools/fee-bump-replacement-comparator",
  steps: [
    { action: "visit", target: "/tools/fee-bump-replacement-comparator" },
    { action: "expect", target: "heading", value: "Fee-Bump Replacement Comparator" },
    { action: "expect", target: "text", value: "No fee-bump pair compared yet" },

    // Same inner, higher outer fee — replacement candidate.
    {
      action: "fill",
      target: "Current fee-bump envelope XDR",
      value: "<base64 current fee-bump>"
    },
    {
      action: "fill",
      target: "Replacement fee-bump envelope XDR",
      value: "<base64 higher-fee fee-bump>"
    },
    { action: "select", target: "Network passphrase", value: "Testnet" },
    { action: "click", target: "Compare fee bumps" },
    { action: "expect", target: "text", value: "Same inner transaction" },
    { action: "expect", target: "text", value: "Outer fee terms" },
    { action: "expect", target: "button", value: "Copy current inner hash" },

    // Changed inner source — equivalent-inner refused.
    {
      action: "fill",
      target: "Replacement fee-bump envelope XDR",
      value: "<base64 fee-bump with different inner source>"
    },
    { action: "click", target: "Compare fee bumps" },
    { action: "expect", target: "text", value: "Incomplete evidence for equivalence" },

    // Ordinary envelope is a notice, not a corrupt-bytes error.
    {
      action: "fill",
      target: "Replacement fee-bump envelope XDR",
      value: "<base64 v1 envelope>"
    },
    { action: "click", target: "Compare fee bumps" },
    {
      action: "expect",
      target: "status",
      value: "This is an ordinary transaction, not a fee bump"
    },

    // Secret key refused and never echoed.
    {
      action: "fill",
      target: "Current fee-bump envelope XDR",
      value: "<ed25519 secret seed>"
    },
    { action: "click", target: "Compare fee bumps" },
    { action: "expect", target: "alert", value: "That input cannot be used" },
    { action: "expectNotVisible", target: "text", value: "<ed25519 secret seed>" },

    { action: "expectNoRequest", target: "network" }
  ]
} as const;
