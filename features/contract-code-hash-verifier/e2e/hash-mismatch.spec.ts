export const spec = {
  route: "/tools/contract-code-hash-verifier",
  steps: [
    { action: "visit", target: "/tools/contract-code-hash-verifier" },
    { action: "fill", target: "Contract ID", value: "mismatch contract fixture" },
    { action: "click", target: "Verify code hash" },
    { action: "expect", target: "a hash mismatch and a note that the reads are not an atomic snapshot" }
  ]
} as const;
