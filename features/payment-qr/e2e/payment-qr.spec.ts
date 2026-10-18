export const spec = {
  route: "/tools/payment-qr",
  steps: [
    { action: "visit", target: "/tools/payment-qr" },
    { action: "expect", target: "heading", value: "Payment QR Generator" },
    { action: "fill", target: "Destination address", value: "<G address>" },
    { action: "fill", target: "Amount", value: "10.5" },
    { action: "click", target: "Generate QR code" },
    { action: "expect", target: "img", value: "QR code encoding the Stellar payment request" },
    { action: "select", target: "Asset", value: "Issued asset" },
    { action: "expect", target: "field", value: "Asset issuer" }
  ]
} as const;
