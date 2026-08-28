export const spec = {
  route: "/tools/account-signers",
  steps: [
    { action: "visit", target: "/tools/account-signers" },
    { action: "expect", target: "heading", value: "Account Signers and Thresholds" },
    { action: "fill", target: "Account address", value: "<funded testnet G address>" },
    { action: "click", target: "Inspect signers" },
    { action: "expect", target: "heading", value: "Signers" },
    { action: "expect", target: "text", value: "Master key" },
    { action: "expect", target: "heading", value: "Thresholds" },
    { action: "switchNetwork", value: "mainnet" },
    { action: "expect", target: "text", value: "No account inspected yet" }
  ]
} as const;
