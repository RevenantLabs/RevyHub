import type { StellarNetwork } from "@/core/network/types";
export type PathVariant = "strict-send" | "strict-receive";
export interface PathPaymentSlippageCalculatorInput { hash: string }
export interface AssetIdentity { type: string; code: string; issuer: string | null }
export interface PathPaymentRecord {
  variant: PathVariant;
  declaredBound: string;
  actualAmount: string;
  boundAsset: AssetIdentity;
  path: AssetIdentity[];
}
export interface PathPaymentSlippageCalculatorResult extends PathPaymentRecord {
  network: StellarNetwork;
  slippageBasisPoints: string;
}
export type PathPaymentSlippageCalculatorErrorCode =
  | "invalid_hash" | "transaction_not_found" | "no_path_payment_operation"
  | "malformed_effect" | "rate_limited" | "request_failed";
