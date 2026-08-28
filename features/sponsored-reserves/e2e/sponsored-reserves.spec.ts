export const spec = {
  route: "/tools/sponsored-reserves",
  steps: [
    { action: "visit", target: "/tools/sponsored-reserves" },
    { action: "expect", target: "heading", value: "Sponsored Reserves Inspector" },
    { action: "expect", target: "text", value: "No account inspected yet" },
    { action: "fill", target: "Account address", value: "<sponsored testnet G address>" },
    { action: "click", target: "Inspect sponsored reserves" },
    { action: "expect", target: "text", value: "Sponsored for this account" },
    { action: "expect", target: "text", value: "Sponsored by this account" },
    { action: "expect", target: "text", value: "Net reserve effect" },
    { action: "expect", target: "table" },
    { action: "expect", target: "cell", value: "Account entry" },
    { action: "expect", target: "button", value: "Copy sponsor for" },
    { action: "fill", target: "Account address", value: "<unsponsored testnet G address>" },
    { action: "click", target: "Inspect sponsored reserves" },
    {
      action: "expect",
      target: "text",
      value: "This account has no sponsorship relationships"
    },
    { action: "switchNetwork", value: "mainnet" },
    { action: "expect", target: "text", value: "No account inspected yet" }
  ]
} as const;
