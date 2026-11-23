export interface AccountMergeValueReconcilerInput {
  envelope: string;
  resultXdr: string;
  metadataXdr: string;
}

export type AccountMergeValueReconcilerErrorCode =
  | "invalid_input" | "malformed_data" | "unsupported_variant" | "too_large" | "incompatible_transaction";

/**
 * - `success`: the operation result reports `accountMergeSuccess` in a successful transaction.
 * - `rolled_back`: the operation reported success but the transaction failed, so nothing moved.
 * - `failed`: the operation result is a failure code.
 * - `unavailable`: the transaction result carries no operation results (it failed before applying).
 */
export type MergeTransferStatus = "success" | "rolled_back" | "failed" | "unavailable";

export interface MergeTransfer {
  /** Zero-based operation index in the (inner) transaction. */
  index: number;
  /** Merge source as written (G… or M…); the transaction source when not overridden. */
  source: string;
  /** Underlying G… account of `source`, used to match ledger snapshots. */
  sourceAccount: string;
  /** Merge destination as written (G… or M…). */
  destination: string;
  /** Underlying G… account of `destination`, used to match ledger snapshots. */
  destinationAccount: string;
  status: MergeTransferStatus;
  /** Protocol result code, for example `accountMergeSuccess` or `opNoAccount`. */
  code: string;
  /** Exact transferred stroops from `sourceAccountBalance`; null unless `status` is `success`. */
  stroops: string | null;
  sourceOverride: boolean;
}

export type EvidenceGapCode =
  | "missing_metadata"
  | "missing_result"
  | "contradictory_metadata"
  | "transaction_failed"
  | "fee_payer_change"
  | "no_merge";

export interface EvidenceGap {
  /** Operation index, or null for a transaction-level gap. */
  index: number | null;
  code: EvidenceGapCode;
}

/** A native balance change observed in metadata that is not part of any merge transfer. */
export interface UnrelatedChange {
  /** Operation index, or null for transaction-level changes. */
  index: number | null;
  account: string;
  /** Signed exact stroops. */
  stroops: string;
}

export type EnvelopeKind = "classic-v0" | "classic-v1" | "fee-bump";

export interface AccountMergeValueReconcilerResult {
  envelopeKind: EnvelopeKind;
  feePayer: string;
  transactionSource: string;
  /** Outer `feeCharged`, exact stroops. */
  feeStroops: string;
  /** Sum of successful merge transfers, exact stroops. */
  mergeProceedsStroops: string;
  /** Net balance change of accounts not party to a merge; null when metadata cannot prove it. */
  unrelatedBalanceChangesStroops: string | null;
  /** Each non-zero unrelated change observed, even when the total cannot be proven. */
  unrelatedChanges: UnrelatedChange[];
  transfers: MergeTransfer[];
  gaps: EvidenceGap[];
  evidence: "complete" | "incomplete";
  /** TransactionMeta union arm, or -1 when metadata was not supplied. */
  metadataVersion: number;
}
