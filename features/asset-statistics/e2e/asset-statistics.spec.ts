/**
 * End-to-end specification for the Asset Supply and Holder Statistics tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/asset-statistics",
  steps: [
    { action: "visit", target: "/tools/asset-statistics" },
    { action: "expect", target: "heading", value: "Asset Supply and Holder Statistics" },
    { action: "fill", target: "Asset code", value: "<testnet asset code>" },
    { action: "fill", target: "Issuer address", value: "<matching testnet issuer G address>" },
    { action: "click", target: "Load asset statistics" },
    { action: "expect", target: "heading", value: "Circulating supply" },
    { action: "expect", target: "rowheader", value: "Authorized" },
    { action: "expect", target: "rowheader", value: "auth_clawback_enabled" },
    { action: "switchNetwork", value: "mainnet" },
    { action: "expect", target: "text", value: "No asset loaded yet" }
  ]
} as const;
