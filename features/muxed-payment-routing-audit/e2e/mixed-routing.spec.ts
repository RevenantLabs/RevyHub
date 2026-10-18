/** Edge journey: compare two muxed IDs with direct transfers on one base account. */
export const spec = {
  route: "/tools/muxed-payment-routing-audit",
  steps: [
    { action: "visit", target: "/tools/muxed-payment-routing-audit" },
    { action: "fill", target: "Base account address", value: "<fixture base account>" },
    { action: "click", target: "Audit recent payments" },
    { action: "expect", target: "text", value: "Muxed ID 7" },
    { action: "expect", target: "text", value: "Muxed ID 9" },
    { action: "expect", target: "text", value: "Direct base-address payments (no muxed ID)" },
    { action: "expect", target: "text", value: "9007199254740993.0000002" }
  ]
} as const;
