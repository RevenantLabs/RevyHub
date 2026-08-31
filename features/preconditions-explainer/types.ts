export type PreconditionsErrorCode =
  | "empty_input"
  | "invalid_xdr"
  | "no_preconditions"
  | "ledger_unavailable"
  | "request_failed";

/**
 * The subset of codes that can come back from the ledger snapshot request.
 *
 * They are carried inside a successful explanation rather than replacing it:
 * a failed snapshot degrades the answer, it does not invalidate the bounds
 * that were decoded locally.
 */
export type LedgerFetchErrorCode = Extract<
  PreconditionsErrorCode,
  "ledger_unavailable" | "request_failed"
>;

export type EnvelopeVariant = "classic-v0" | "classic-v1" | "fee-bump";

export interface PreconditionsInput {
  envelope: string;
}

/** What Horizon reported as the newest closed ledger when the answer was taken. */
export interface LedgerSnapshot {
  sequence: number;
  closedAt: string;
  /** `closedAt` as whole Unix seconds, kept as a string so it stays exact. */
  closedAtUnix: string;
}

export type BoundStatus = "satisfied" | "not_yet" | "expired" | "unknown";

export type Verdict = "satisfiable" | "not_yet" | "expired" | "unknown";

/** The clock the evaluation compared time bounds against. */
export type ClockSource = "ledger-close-time" | "local-clock";

export interface TimeBoundsExplanation {
  /** Whole Unix seconds as decimal strings; "0" means the bound is not set. */
  minTime: string;
  maxTime: string;
  minTimeIso: string | null;
  maxTimeIso: string | null;
  /** Signed seconds from the reference clock; negative means already past. */
  minTimeDeltaSeconds: string | null;
  maxTimeDeltaSeconds: string | null;
  status: BoundStatus;
}

export interface LedgerBoundsExplanation {
  minLedger: number;
  /** Exclusive upper bound; 0 means the transaction has no ledger ceiling. */
  maxLedger: number;
  status: BoundStatus;
  ledgersUntilMin: number | null;
  ledgersUntilMax: number | null;
}

export type ExtraSignerKind =
  | "ed25519"
  | "pre-auth-tx"
  | "hash-x"
  | "ed25519-signed-payload";

export interface ExtraSignerExplanation {
  kind: ExtraSignerKind;
  /** Strkey encoding of the signer. Never a secret. */
  key: string;
}

/** The preconditions exactly as the envelope declares them, before evaluation. */
export interface DecodedPreconditions {
  variant: EnvelopeVariant;
  sourceAccount: string;
  sequenceNumber: string;
  timeBounds: { minTime: string; maxTime: string } | null;
  ledgerBounds: { minLedger: number; maxLedger: number } | null;
  minSequenceNumber: string | null;
  minSequenceAge: string | null;
  minSequenceLedgerGap: number | null;
  extraSigners: ExtraSignerExplanation[];
}

export interface PreconditionsExplanation {
  variant: EnvelopeVariant;
  sourceAccount: string;
  sequenceNumber: string;
  timeBounds: TimeBoundsExplanation | null;
  ledgerBounds: LedgerBoundsExplanation | null;
  minSequenceNumber: string | null;
  minSequenceAge: string | null;
  minSequenceLedgerGap: number | null;
  extraSigners: ExtraSignerExplanation[];
  /** True when at least one precondition can only be settled by reading the source account. */
  accountDependent: boolean;
  verdict: Verdict;
  /** Null when the snapshot could not be fetched — the explanation is then degraded. */
  ledger: LedgerSnapshot | null;
  degradedReason: LedgerFetchErrorCode | null;
  clockSource: ClockSource;
  /** When this snapshot was taken, so a stale answer is visibly stale. */
  evaluatedAt: string;
}
