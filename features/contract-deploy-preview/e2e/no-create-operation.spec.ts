/**
 * Edge-case end-to-end specification: an envelope with no contract-creation
 * host function. Distinct from the main spec because the expected outcome
 * names the operation types that were actually found.
 */
export const spec = {
  route: "/tools/contract-deploy-preview",
  steps: [
    { action: "visit", target: "/tools/contract-deploy-preview" },
    { action: "fill", target: "Transaction envelope (base64 XDR)", value: "payment-only envelope fixture" },
    { action: "click", target: "Preview deploy" },
    { action: "expect", target: "a 'No contract-creation host function found' notice naming the payment operation" }
  ]
} as const;
