export const spec = {
  route: "/tools/txrep-converter",
  steps: [
    { action: "visit", target: "/tools/txrep-converter" },
    { action: "expect", target: "heading", value: "SEP-0011 Txrep Converter" },
    { action: "click", target: "Convert" },
    { action: "expect", target: "alert", value: "Paste an envelope first" }
  ]
} as const;
