/** Error codes the UI maps to actionable copy. */
export type SignerRotationErrorCode =
  | "empty_input"
  | "invalid_input"
  | "malformed_data"
  | "unsupported_variant"
  | "too_large";

export type ThresholdLevel = "low" | "medium" | "high";

export type EnvelopeKind = "classic-v0" | "classic-v1" | "fee-bump";

export type SignerKind =
  | "ed25519_public_key"
  | "sha256_hash"
  | "preauth_tx"
  | "ed25519_signed_payload";

export interface AccountThresholds {
  low: string | null;
  medium: string | null;
  high: string | null;
}

export interface SignerEntry {
  key: string;
  weight: string;
  kind: SignerKind;
  isMaster: boolean;
}

export type RotationChangeKind =
  | "master_weight"
  | "threshold_low"
  | "threshold_medium"
  | "threshold_high"
  | "signer_set"
  | "signer_remove"
  | "ignored_operation";

export interface RotationChange {
  kind: RotationChangeKind;
  /** Signer key or threshold name when applicable. */
  target: string | null;
  before: string | null;
  after: string | null;
}

export interface RotationStep {
  index: number;
  operationType: string;
  effectiveSource: string;
  inheritedSource: boolean;
  appliesToSnapshot: boolean;
  changes: RotationChange[];
}

export interface ThresholdReachability {
  level: ThresholdLevel;
  required: string | null;
  available: string | null;
  shortfall: string | null;
  /**
   * `null` when the required threshold or available weight is unavailable —
   * never invent a reachability claim from missing evidence.
   */
  reachable: boolean | null;
}

export interface StepImpact {
  stepIndex: number;
  afterSigners: SignerEntry[];
  afterThresholds: AccountThresholds;
  totalWeight: string | null;
  reachability: ThresholdReachability[];
  anyUnreachable: boolean;
  newlyUnreachable: ThresholdLevel[];
  recovered: ThresholdLevel[];
}

export interface LockoutReport {
  /** True when any step before the final one left a threshold unreachable. */
  intermediateLockout: boolean;
  /** True when the final state still has an unreachable threshold. */
  finalLockout: boolean;
  /** Index of the first operation that introduced an unreachable threshold. */
  firstLockingStepIndex: number | null;
  lockedLevelsFinal: ThresholdLevel[];
  /** Intermediate lockout that the remaining ops later cleared. */
  recoveredFinal: boolean;
}

export interface EvidenceCoverage {
  hasSigners: boolean;
  hasThresholds: boolean;
  hasSetOptions: boolean;
  complete: boolean;
}

export interface SignerRotationResult {
  accountId: string;
  envelopeKind: EnvelopeKind;
  networkPassphrase: string;
  initialSigners: SignerEntry[];
  initialThresholds: AccountThresholds;
  initialTotalWeight: string | null;
  initialReachability: ThresholdReachability[];
  steps: RotationStep[];
  impacts: StepImpact[];
  finalSigners: SignerEntry[];
  finalThresholds: AccountThresholds;
  finalTotalWeight: string | null;
  finalReachability: ThresholdReachability[];
  lockout: LockoutReport;
  evidence: EvidenceCoverage;
}

export interface SignerRotationInput {
  accountSnapshot: string;
  envelopeXdr: string;
  networkPassphrase: string;
}
