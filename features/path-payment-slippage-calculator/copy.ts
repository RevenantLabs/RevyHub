import type { PathPaymentSlippageCalculatorErrorCode, PathVariant } from "@/features/path-payment-slippage-calculator/types";
export const copy = {
  formLabel: "Settled transaction hash", formHint: "Enter the 64-character hexadecimal hash.",
  submit: "Calculate slippage", working: "Loading execution…", emptyTitle: "No path payment inspected",
  emptyDescription: "Load one settled transaction to compare its executed amount with the declared bound.",
  resultTitle: "Realized slippage", declaredBound: "Declared bound", actualAmount: "Actual executed amount",
  pathTitle: "Executed path", directPath: "Direct conversion; no intermediate assets were reported."
} as const;
export const variantCopy: Record<PathVariant, string> = {
  "strict-send": "Minimum destination bound (strict send)",
  "strict-receive": "Maximum send bound (strict receive)"
};
export const errorCopy: Record<PathPaymentSlippageCalculatorErrorCode, { title: string; description: string }> = {
  invalid_hash: { title: "Transaction hash is invalid", description: "Enter exactly 64 hexadecimal characters." },
  transaction_not_found: { title: "Transaction was not found", description: "Check the hash and selected network, then try again." },
  no_path_payment_operation: { title: "No path payment found", description: "Use a settled transaction containing a strict-send or strict-receive path payment." },
  malformed_effect: { title: "Execution data is incomplete", description: "Horizon returned a path payment without the amounts needed for an exact audit." },
  rate_limited: { title: "Horizon rate limit reached", description: "Wait briefly, then retry the request." },
  request_failed: { title: "Horizon request failed", description: "Check your connection and retry." }
};
