/**
 * Types for the offline transaction balance-change reconciler.
 *
 * Amounts are integer stroop strings (never floats). Asset identity keeps the
 * issuer for every issued asset so two USDC lines from different issuers never
 * collapse into one residual.
 */

export type TransactionBalanceChangeReconcilerErrorCode =
  | "empty_input"
  | "invalid_input"
  | "malformed_data"
  | "unsupported_variant"
  | "too_large";

/** Metadata variants the installed SDK exposes on `xdr.TransactionMeta`. */
export type MetaVariant = "operations" | "v1" | "v2" | "v3";

export type ChangeKind = "created" | "updated" | "removed" | "state";

export type ChangeSource = "tx_before" | "operation" | "tx_after";

export type AssetRef =
  | { kind: "native" }
  | { kind: "credit"; code: string; issuer: string };

export type IncompleteEvidenceReason =
  | "missing_fee_evidence"
  | "unexplained_residual"
  | "unpaired_change"
  | "skipped_non_balance";

export interface TransactionBalanceChangeReconcilerInput {
  envelopeXdr: string;
  resultXdr: string;
  metaXdr: string;
  networkPassphrase: string;
}

export interface EntryChangePair {
  /** Canonical LedgerKey XDR (base64). */
  ledgerKey: string;
  accountId: string | null;
  asset: AssetRef | null;
  /** Balance before the change, in stroops; null when created or unknown. */
  beforeBalance: string | null;
  /** Balance after the change, in stroops; null when removed or unknown. */
  afterBalance: string | null;
  /** Exact after − before when both sides are known; otherwise null. */
  delta: string | null;
  changeKinds: ChangeKind[];
  source: ChangeSource;
  operationIndex: number | null;
  /** True when the pair is missing a before or after side that balance math needs. */
  incomplete: boolean;
}

export interface BalanceDelta {
  accountId: string;
  asset: AssetRef;
  before: string;
  after: string;
  delta: string;
}

export interface FeeInfo {
  /** Fee charged from the result XDR, in stroops. Null when result could not supply it. */
  feeCharged: string | null;
  /** Account that paid the fee, from the envelope. */
  feeSource: string | null;
  /** True when the fee source differs from the inner/classic source account. */
  sponsored: boolean;
}

export interface AssetResidual {
  asset: AssetRef;
  /** Sum of per-account deltas for this asset. */
  summedDelta: string;
  /**
   * Conservation expectation: native should sum to −feeCharged; issued assets
   * should sum to 0. Null when fee evidence is missing for native.
   */
  expectedSum: string | null;
  /** summedDelta − expectedSum when expectedSum is known; otherwise null. */
  residual: string | null;
  reconciled: boolean;
}

export interface EvidenceProvenance {
  hasEnvelope: boolean;
  hasResult: boolean;
  hasMetadata: boolean;
  metaVariant: MetaVariant;
  balanceEntryCount: number;
  skippedNonBalanceEntries: number;
  incompleteReasons: IncompleteEvidenceReason[];
}

export interface TransactionBalanceChangeReconcilerResult {
  metaVariant: MetaVariant;
  fee: FeeInfo;
  pairs: EntryChangePair[];
  deltas: BalanceDelta[];
  residuals: AssetResidual[];
  fullyReconciled: boolean;
  evidence: EvidenceProvenance;
}
