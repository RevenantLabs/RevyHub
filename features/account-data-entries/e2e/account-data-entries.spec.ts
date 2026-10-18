/**
 * End-to-end specification for the Account Data Entry Viewer tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/account-data-entries",
  steps: [
    { action: "visit", target: "/tools/account-data-entries" },
    { action: "expect", target: "heading", value: "Account Data Entry Viewer" },
    { action: "fill", target: "Account address", value: "<funded testnet G address with data>" },
    { action: "click", target: "Load data entries" },
    { action: "expect", target: "table" },
    { action: "expect", target: "columnheader", value: "Decoded value" },
    { action: "expect", target: "button", value: "Copy greeting decoded value" },
    { action: "switchNetwork", value: "mainnet" },
    { action: "expect", target: "text", value: "No account loaded yet" }
  ]
} as const;
