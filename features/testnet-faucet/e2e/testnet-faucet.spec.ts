export const spec = {
  route: "/tools/testnet-faucet",
  steps: [
    { action: "visit", target: "/tools/testnet-faucet" },
    { action: "expect", target: "heading", value: "Testnet Faucet" },
    { action: "fill", target: "Testnet account address", value: "<unfunded G address>" },
    { action: "click", target: "Fund this account" },
    { action: "expect", target: "status", value: "Account funded on testnet" },
    { action: "click", target: "Fund this account" },
    { action: "expect", target: "alert", value: "This account already exists on testnet" }
  ]
} as const;
