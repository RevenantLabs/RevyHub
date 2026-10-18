import type { StellarNetwork } from "@/core/network/types";

export type PaymentReceiptReconcilerErrorCode =
  | "empty_input"
  | "invalid_hash"
  | "transaction_not_found"
  | "transaction_failed"
  | "unsupported_operation"
  | "incomplete_effects"
  | "request_failed";

export interface PaymentReceiptReconcilerInput {
  hash: string;
}

/** Asset identity keyed by code + issuer (native has neither). */
export type ReceiptAsset =
  | { type: "native" }
  | { type: "credit"; code: string; issuer: string };

export interface AssetAmount {
  asset: ReceiptAsset;
  /** Exact Horizon amount string — never a float. */
  amount: string;
}

export type SupportedPaymentType =
  | "payment"
  | "path_payment_strict_send"
  | "path_payment_strict_receive";

export interface PaymentOperation {
  id: string;
  type: SupportedPaymentType;
  sourceAccount: string;
  from: string;
  to: string;
  /** Destination amount for payment / path-payment. */
  amount: string;
  asset: ReceiptAsset;
  /** Present on path payments — source-side amount. */
  sourceAmount?: string;
  sourceAsset?: ReceiptAsset;
}

export type BalanceEffectType = "account_debited" | "account_credited";

export interface EffectEvidence {
  id: string;
  type: BalanceEffectType;
  account: string;
  amount: string;
  asset: ReceiptAsset;
  /** Operation TOID this effect belongs to. */
  operationId: string;
}

export interface EffectLink {
  operationId: string;
  debits: EffectEvidence[];
  credits: EffectEvidence[];
}

/** Ops or effects that belong to the transaction but sit outside the receipt. */
export interface OutsideItem {
  kind: "operation" | "effect";
  id: string;
  type: string;
}

export interface ReceiptTotals {
  debits: AssetAmount[];
  credits: AssetAmount[];
  /** Transaction fee charged, in stroops. */
  feeCharged: string;
}

/** Copyable public receipt header. */
export interface PublicReceipt {
  hash: string;
  network: StellarNetwork;
  ledger: number;
}

export interface PaymentReceipt {
  hash: string;
  network: StellarNetwork;
  ledger: number;
  createdAt: string;
  sourceAccount: string;
  feeCharged: string;
  operations: PaymentOperation[];
  links: EffectLink[];
  totals: ReceiptTotals;
  outside: OutsideItem[];
  publicReceipt: PublicReceipt;
}

export type PaymentReceiptReconcilerResult = PaymentReceipt;
