import type { PathPaymentSlippageCalculatorResult } from "@/features/path-payment-slippage-calculator/types";
export const pathPaymentSlippageCalculatorFixture: PathPaymentSlippageCalculatorResult = {
  variant: "strict-send", declaredBound: "9.5", actualAmount: "10", slippageBasisPoints: "526",
  boundAsset: { type: "native", code: "XLM", issuer: null }, path: [], network: "testnet"
};
