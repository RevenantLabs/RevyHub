/**
 * End-to-end specification for the Sponsorship and Reserve Planner tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/sponsorship-planner",
  steps: [
    { action: "visit", target: "/tools/sponsorship-planner" },
    { action: "expect", target: "heading", value: "Sponsorship and Reserve Planner" },
    { action: "expect", target: "text", value: "No sponsorship planned yet" },
    { action: "fill", target: "Sponsor address", value: "<sponsor testnet G address>" },
    { action: "fill", target: "Sponsored account address", value: "<sponsored testnet G address>" },
    { action: "click", target: "Plan sponsorship" },
    { action: "expect", target: "text", value: "Sponsorship plan" },
    { action: "expect", target: "text", value: "Subentries the sponsor would cover" },
    { action: "expect", target: "text", value: "Sponsor's minimum balance" },
    { action: "expect", target: "text", value: "Sponsored account's minimum balance" },
    { action: "expect", target: "text", value: "Operation order" },
    { action: "expect", target: "table" },
    { action: "switchNetwork", value: "mainnet" },
    { action: "expect", target: "text", value: "No sponsorship planned yet" }
  ]
} as const;
