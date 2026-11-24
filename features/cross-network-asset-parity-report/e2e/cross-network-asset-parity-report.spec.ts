export const spec = {
  route: "/tools/cross-network-asset-parity-report",
  offline: false,
  steps: [
    { action: "visit", target: "/tools/cross-network-asset-parity-report" },
    { action: "expect", target: "heading", value: "Cross-Network Asset Metadata Parity Report" },
    { action: "fill", target: "Asset pairs JSON", value: "[]" },
    { action: "click", target: "Compare metadata" },
    { action: "expect", target: "alert" }
  ]
} as const
