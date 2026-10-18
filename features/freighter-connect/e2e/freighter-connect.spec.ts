export const spec = {
  route: "/tools/freighter-connect",
  steps: [
    { action: "visit", target: "/tools/freighter-connect" },
    { action: "expect", target: "heading", value: "Freighter Connect" },
    { action: "expectWithoutExtension", target: "text", value: "Freighter is not installed in this browser" },
    { action: "installExtension", target: "freighter" },
    { action: "click", target: "Check again" },
    { action: "click", target: "Connect Freighter" },
    { action: "expect", target: "status", value: "Freighter is connected" },
    { action: "switchNetwork", value: "mainnet" },
    { action: "expect", target: "status", value: "The wallet and this page are on different networks" }
  ]
} as const;
