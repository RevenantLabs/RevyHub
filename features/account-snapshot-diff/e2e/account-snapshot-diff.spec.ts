export const spec = {
  route: "/tools/account-snapshot-diff",
  steps: [
    { action: "visit", target: "/tools/account-snapshot-diff" },
    { action: "expect", target: "heading", value: "Account Snapshot Difference Viewer" },
    { action: "expect", target: "text", value: "Nothing compared yet" },

    // A balance moved.
    { action: "fill", target: "Before snapshot JSON", value: "<account resource JSON>" },
    { action: "fill", target: "After snapshot JSON", value: "<same account, USDC down 50>" },
    { action: "click", target: "Compare snapshots" },
    { action: "expect", target: "text", value: "Balances" },
    { action: "expect", target: "text", value: "-50" },

    // Reordered arrays are not a difference.
    { action: "fill", target: "After snapshot JSON", value: "<same account, arrays reversed>" },
    { action: "click", target: "Compare snapshots" },
    { action: "expect", target: "status", value: "These snapshots are identical" },

    // Filters narrow by section and by change type.
    { action: "fill", target: "After snapshot JSON", value: "<same account, signer added>" },
    { action: "click", target: "Compare snapshots" },
    { action: "select", target: "Section", value: "Signers" },
    { action: "expectNotVisible", target: "text", value: "Thresholds" },
    { action: "click", target: "Reset filters" },

    // Unmodelled fields are reported, not hidden.
    { action: "fill", target: "After snapshot JSON", value: "<same account, extra field>" },
    { action: "click", target: "Compare snapshots" },
    { action: "expect", target: "status", value: "Some fields were not compared" },

    // Two different accounts are refused outright.
    { action: "fill", target: "After snapshot JSON", value: "<a different account>" },
    { action: "click", target: "Compare snapshots" },
    { action: "expect", target: "alert", value: "These snapshots are of different accounts" },

    { action: "expect", target: "button", value: "Copy JSON summary" },
    { action: "expectNoRequest", target: "network" }
  ]
} as const;
