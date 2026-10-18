export const spec = {
  route: "/tools/contract-code-hash-verifier",
  steps: [
    { action: "visit", target: "/tools/contract-code-hash-verifier" },
    { action: "fill", target: "Contract ID", value: "wasm contract fixture" },
    { action: "click", target: "Verify code hash" },
    { action: "expect", target: "a matching hash and the same latest ledger on both reads" },
    { action: "click", target: "Reset" },
    { action: "expect", target: "idle state and a cleared contract ID" }
  ]
} as const;
