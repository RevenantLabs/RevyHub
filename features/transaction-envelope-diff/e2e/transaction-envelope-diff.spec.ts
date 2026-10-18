export const spec = {
  route: "/tools/transaction-envelope-diff",
  steps: [
    { action: "visit", target: "/tools/transaction-envelope-diff" },
    { action: "expect", target: "heading", value: "Transaction Envelope Difference Viewer" },
    { action: "expect", target: "text", value: "Nothing compared yet" },

    // One amount changed.
    { action: "fill", target: "Before envelope XDR", value: "<base64 v1 envelope>" },
    { action: "fill", target: "After envelope XDR", value: "<same envelope, amount 10.6>" },
    { action: "select", target: "Network passphrase", value: "Testnet" },
    { action: "click", target: "Compare envelopes" },
    { action: "expect", target: "text", value: "tx.operations[0].amount" },
    { action: "expect", target: "text", value: "Operations" },

    // Whitespace alone is not a difference.
    { action: "fill", target: "After envelope XDR", value: "<same envelope, line wrapped>" },
    { action: "click", target: "Compare envelopes" },
    { action: "expect", target: "status", value: "These envelopes are identical" },

    // A signature-only change is called out as such.
    { action: "fill", target: "After envelope XDR", value: "<same envelope, signed once>" },
    { action: "click", target: "Compare envelopes" },
    { action: "expect", target: "status", value: "Only the signatures differ" },

    // Filters narrow the view without changing the diff.
    { action: "select", target: "Show", value: "Unchanged only" },
    { action: "expectNotVisible", target: "text", value: "tx.signatures.count" },
    { action: "click", target: "Reset filter" },

    // A fee bump keeps its layers apart.
    { action: "fill", target: "Before envelope XDR", value: "<base64 fee-bump envelope>" },
    { action: "fill", target: "After envelope XDR", value: "<same fee bump, higher bid>" },
    { action: "click", target: "Compare envelopes" },
    { action: "expect", target: "text", value: "outer.maxFee" },
    { action: "expectNotVisible", target: "text", value: "inner.fee" },

    // Each side reports its own decoding failure.
    { action: "fill", target: "After envelope XDR", value: "not base64 at all" },
    { action: "click", target: "Compare envelopes" },
    { action: "expect", target: "alert", value: "The after envelope could not be read" },

    { action: "expect", target: "button", value: "Copy JSON summary" },
    { action: "expectNoRequest", target: "network" }
  ]
} as const;
