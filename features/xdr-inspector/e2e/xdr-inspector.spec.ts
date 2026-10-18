export const spec = {
  route: "/tools/xdr-inspector",
  steps: [
    { action: "visit", target: "/tools/xdr-inspector" },
    { action: "expect", target: "heading", value: "Transaction XDR Inspector" },
    { action: "fill", target: "Transaction envelope XDR", value: "<base64 v1 envelope>" },
    { action: "click", target: "Inspect envelope" },
    { action: "expect", target: "text", value: "Transaction" },
    { action: "expect", target: "list", value: "Operations" },
    { action: "fill", target: "Transaction envelope XDR", value: "<base64 fee-bump envelope>" },
    { action: "click", target: "Inspect envelope" },
    { action: "expect", target: "text", value: "Fee-bump wrapper" },
    { action: "expectNoRequest", target: "network" }
  ]
} as const;
