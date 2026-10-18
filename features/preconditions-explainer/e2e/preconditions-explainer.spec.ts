/**
 * End-to-end specification for the Transaction Preconditions Explainer.
 *
 * Written as executable steps so the behaviour is reviewable before a browser
 * runner is wired into CI.
 */
export const spec = {
  route: "/tools/preconditions-explainer",
  steps: [
    { action: "visit", target: "/tools/preconditions-explainer" },
    { action: "expect", target: "heading", value: "Transaction Preconditions Explainer" },
    { action: "expect", target: "No transaction explained yet" },
    { action: "selectNetwork", target: "network", value: "Testnet" },

    { action: "fill", target: "Transaction envelope XDR", value: "<fixture open envelope XDR>" },
    { action: "click", target: "Explain preconditions" },

    { action: "expect", target: "The bounds on this transaction are satisfiable right now" },
    { action: "expect", target: "Snapshot" },
    { action: "expect", target: "Current ledger" },
    { action: "expect", target: "Answer taken at" },
    { action: "expect", target: "Time bounds" },
    { action: "expectMatch", target: "Valid from", value: "UTC (1 hour ago)" },
    { action: "expectMatch", target: "Valid until", value: "UTC (in 2 hours)" },
    { action: "expect", target: "Ledger bounds" },
    { action: "expectMatch", target: "Valid from ledger", value: "ledgers ago" },
    { action: "expectMatch", target: "Invalid from ledger", value: "ledgers away" },
    { action: "expect", target: "Sequence rules" },
    { action: "expect", target: "Needs the source account" },
    { action: "expect", target: "Extra signers" },
    { action: "click", target: "Copy extra signer 1" },
    { action: "expectClipboard", target: "clipboard", value: "<fixture extra signer G-address>" },

    { action: "click", target: "Explain another transaction" },
    { action: "expect", target: "No transaction explained yet" },

    { action: "fill", target: "Transaction envelope XDR", value: "<fixture expired envelope XDR>" },
    { action: "click", target: "Explain preconditions" },
    { action: "expect", target: "This transaction can no longer be included" },

    { action: "click", target: "Explain another transaction" },
    {
      action: "fill",
      target: "Transaction envelope XDR",
      value: "<fixture envelope with no preconditions>"
    },
    { action: "click", target: "Explain preconditions" },
    {
      action: "expect",
      target: "This transaction declares no preconditions, so it is valid indefinitely"
    },

    { action: "stubHorizon", target: "GET /ledgers?order=desc&limit=1", value: "503" },
    { action: "click", target: "Explain another transaction" },
    {
      action: "fill",
      target: "Transaction envelope XDR",
      value: "<fixture ledger-bounds-only envelope XDR>"
    },
    { action: "click", target: "Explain preconditions" },
    { action: "expect", target: "Answered without the current ledger" },
    { action: "expect", target: "Ledger bounds" },
    { action: "expectNot", target: "error page" },

    { action: "fill", target: "Transaction envelope XDR", value: "<a secret seed>" },
    { action: "click", target: "Explain preconditions" },
    { action: "expect", target: "That did not decode to a transaction envelope" },
    { action: "expectNoNetworkRequest", target: "horizon" }
  ]
} as const;
