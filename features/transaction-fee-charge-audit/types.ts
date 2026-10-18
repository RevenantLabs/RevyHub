import type { StellarNetwork } from "@/core/network/types";

/** Settled envelope shape — classic single-layer or fee-bump wrapper. */
export type EnvelopeKind = "classic" | "fee_bump";

/**
 * Offered versus charged fee, always in stroops as decimal strings so values
 * past `Number.MAX_SAFE_INTEGER` stay exact.
 */
export interface FeeBreakdownValues {
  /** Maximum fee offered (outer bid for a fee bump). */
  maxFee: string;
  /** Fee actually charged when the transaction settled. */
  feeCharged: string;
  /** Exact `maxFee - feeCharged` in stroops. */
  difference: string;
}

export interface ClassicEnvelopeAudit {
  kind: "classic";
  sourceAccount: string;
  fees: FeeBreakdownValues;
}

export interface FeeBumpEnvelopeAudit {
  kind: "fee_bump";
  /** Outer fee source — the account that paid the inclusion fee. */
  outerFeeSource: string;
  /** Inner transaction source — kept separate from the fee payer. */
  innerSourceAccount: string;
  /** Outer offered / charged / difference. */
  fees: FeeBreakdownValues;
  /**
   * Inner fee bid recorded on the wrapped transaction. Once wrapped it does
   * not pay; it is shown only so the two layers stay distinct.
   */
  innerFee: string;
}

export type EnvelopeAudit = ClassicEnvelopeAudit | FeeBumpEnvelopeAudit;

export interface LedgerContextData {
  sequence: number;
  closedAt: string | null;
  baseFeeInStroops: string | null;
}

export interface TransactionFeeChargeAuditResult {
  hash: string;
  network: StellarNetwork;
  operationCount: number;
  ledger: LedgerContextData;
  envelope: EnvelopeAudit;
}

export interface TransactionFeeChargeAuditInput {
  hash: string;
}

export type TransactionFeeChargeAuditErrorCode =
  | "empty_input"
  | "invalid_hash"
  | "transaction_not_found"
  | "ledger_not_found"
  | "invalid_fee_data"
  | "unsupported_envelope"
  | "request_failed";

/** Raw Horizon transaction fields this tool reads. */
export interface HorizonTransactionRecord {
  hash: string;
  ledger: number;
  source_account: string;
  fee_account?: string | null;
  fee_charged: string | number;
  max_fee: string | number;
  operation_count: number;
  envelope_xdr?: string;
  inner_transaction?: {
    max_fee?: string | number;
    fee_charged?: string | number;
    source_account?: string;
  } | null;
}

export interface HorizonLedgerRecord {
  sequence: number;
  closed_at?: string;
  base_fee_in_stroops?: string | number;
}
