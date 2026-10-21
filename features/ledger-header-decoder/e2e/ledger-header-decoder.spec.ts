/** Browser journey: paste a complete header, decode locally, then inspect the labels. */
export const spec = {
  route: "/tools/ledger-header-decoder",
  steps: [
    { action: "visit", target: "/tools/ledger-header-decoder" },
    { action: "expect", target: "heading", value: "Ledger Header XDR Decoder" },
    { action: "fill", target: "Ledger header XDR", value: "<standardHeaderXdr fixture>" },
    { action: "click", target: "Decode header" },
    { action: "expect", target: "label", value: "Ledger sequence" },
    { action: "expect", target: "label", value: "Base reserve" },
    { action: "expect", target: "label", value: "Close time" },
    { action: "expectNoRequest", target: "network" }
  ]
} as const;
