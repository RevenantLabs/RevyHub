/** Browser journey: audit a mixed sample and read its explicit coverage. */
export const spec = {
  route: "/tools/muxed-payment-routing-audit",
  steps: [
    { action: "visit", target: "/tools/muxed-payment-routing-audit" },
    { action: "expect", target: "heading", value: "Muxed Payment Routing Audit" },
    { action: "fill", target: "Base account address", value: "<public G address>" },
    { action: "click", target: "Audit recent payments" },
    { action: "expect", target: "text", value: "Bounded history sample" },
    { action: "expect", target: "text", value: "Direct base-address payments (no muxed ID)" }
  ]
} as const;
