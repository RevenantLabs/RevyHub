export const spec = {
  route: "/tools/transaction-size-analyzer",
  steps: [
    { action: "visit", target: "/tools/transaction-size-analyzer" },
    { action: "expect", target: "heading", value: "Transaction Envelope Byte-Size Analyzer" },
    { action: "expect", target: "text", value: "No envelope measured yet" },

    // A classic envelope: totals, then an itemisation that adds up.
    { action: "fill", target: "Transaction envelope XDR", value: "<base64 v1 envelope>" },
    { action: "click", target: "Measure envelope" },
    { action: "expect", target: "text", value: "Totals" },
    { action: "expect", target: "text", value: "Operations vector" },
    { action: "expect", target: "text", value: "Signatures vector" },
    { action: "expect", target: "text", value: "Measured total" },
    { action: "expect", target: "button", value: "Copy measured XDR byte count" },

    // A fee bump adds an inner layer, counted once.
    { action: "fill", target: "Transaction envelope XDR", value: "<base64 fee-bump envelope>" },
    { action: "click", target: "Measure envelope" },
    { action: "expect", target: "text", value: "Inner transaction" },
    { action: "expect", target: "text", value: "Inner envelope (counted once)" },

    // A budget reports exact headroom.
    { action: "fill", target: "Byte budget (optional)", value: "4096" },
    { action: "click", target: "Measure envelope" },
    { action: "expect", target: "status", value: "Within budget" },

    // And exact overage, without claiming the network would reject it.
    { action: "fill", target: "Byte budget (optional)", value: "16" },
    { action: "click", target: "Measure envelope" },
    { action: "expect", target: "status", value: "Over budget" },

    // A non-integer budget is refused rather than rounded.
    { action: "fill", target: "Byte budget (optional)", value: "1e3" },
    { action: "click", target: "Measure envelope" },
    { action: "expect", target: "alert", value: "The budget must be a whole number of bytes" },

    { action: "expectNoRequest", target: "network" }
  ]
} as const;
