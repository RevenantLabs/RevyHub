/** Edge-case browser journey: future upgrade variants remain inspectable as raw bytes. */
export const spec = {
  route: "/tools/ledger-header-decoder",
  steps: [
    { action: "visit", target: "/tools/ledger-header-decoder" },
    { action: "fill", target: "Ledger header XDR", value: "<headerWithUpgradeXdr fixture>" },
    { action: "click", target: "Decode header" },
    { action: "expect", target: "text", value: "Unrecognized upgrade type (99)" },
    { action: "expect", target: "text", value: "0000006312345678" },
    { action: "expectNoRequest", target: "network" }
  ]
} as const;
