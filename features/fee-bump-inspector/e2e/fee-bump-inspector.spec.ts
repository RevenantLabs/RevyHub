export const spec = {
  route: "/tools/fee-bump-inspector",
  steps: [
    { action: "visit", target: "/tools/fee-bump-inspector" },
    { action: "expect", target: "heading", value: "Fee-Bump Envelope Inspector" },
    { action: "expect", target: "text", value: "No fee-bump envelope inspected yet" },

    // A fee bump: two layers, two hashes, two signature counts.
    { action: "fill", target: "Fee-bump envelope XDR", value: "<base64 fee-bump envelope>" },
    { action: "select", target: "Network passphrase", value: "Testnet" },
    { action: "click", target: "Inspect fee bump" },
    { action: "expect", target: "text", value: "Outer layer — the fee bump" },
    { action: "expect", target: "text", value: "Inner layer — the transaction that executes" },
    { action: "expect", target: "button", value: "Copy outer transaction hash" },
    { action: "expect", target: "button", value: "Copy inner transaction hash" },
    { action: "expect", target: "list", value: "Inner operations" },

    // The same envelope on another network produces different hashes.
    { action: "select", target: "Network passphrase", value: "Public network" },
    { action: "click", target: "Inspect fee bump" },
    { action: "expect", target: "text", value: "Public network" },

    // A custom passphrase is used verbatim.
    { action: "select", target: "Network passphrase", value: "Custom passphrase…" },
    {
      action: "fill",
      target: "Custom network passphrase",
      value: "Standalone Network ; February 2017"
    },
    { action: "click", target: "Inspect fee bump" },
    { action: "expect", target: "text", value: "Custom network" },

    // An ordinary envelope is a notice, not an error.
    { action: "fill", target: "Fee-bump envelope XDR", value: "<base64 v1 envelope>" },
    { action: "click", target: "Inspect fee bump" },
    { action: "expect", target: "status", value: "This is an ordinary transaction, not a fee bump" },

    // A secret key is refused outright and never echoed.
    { action: "fill", target: "Fee-bump envelope XDR", value: "<ed25519 secret seed>" },
    { action: "click", target: "Inspect fee bump" },
    { action: "expect", target: "alert", value: "That is not valid base64" },
    { action: "expectNotVisible", target: "text", value: "<ed25519 secret seed>" },

    { action: "expectNoRequest", target: "network" }
  ]
} as const;
