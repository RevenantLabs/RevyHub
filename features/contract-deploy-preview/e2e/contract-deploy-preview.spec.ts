/**
 * End-to-end specification for the Contract Deploy Preview tool.
 * Documented as executable steps — see `features/xdr-inspector/e2e` for the
 * established format this follows.
 */
export const spec = {
  route: "/tools/contract-deploy-preview",
  steps: [
    { action: "visit", target: "/tools/contract-deploy-preview" },
    { action: "fill", target: "Transaction envelope (base64 XDR)", value: "CreateContractV2 fixture envelope" },
    { action: "click", target: "Preview deploy" },
    { action: "expect", target: "the address preimage source, wasm executable and two constructor arguments" },
    { action: "click", target: "Reset" },
    { action: "expect", target: "idle state and a cleared field" }
  ]
} as const;
