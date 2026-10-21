export const spec = {
  route: "/tools/txrep-converter",
  steps: [
    { action: "visit", target: "/tools/txrep-converter" },
    { action: "expect", target: "heading", value: "SEP-0011 Txrep Converter" },
    { action: "expect", target: "text", value: "Round trip did not match" }
  ]
} as const;
