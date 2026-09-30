/**
 * End-to-end specification for the Payment Memo Policy Checker tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/payment-memo-policy-checker",
  steps: [
    { action: "visit", target: "/tools/payment-memo-policy-checker" },
    { action: "expect", target: "heading", value: "Payment Memo Policy Checker" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
