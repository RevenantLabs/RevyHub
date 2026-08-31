export type EnvelopeVariant = "classic-v0" | "classic-v1" | "fee-bump";

export type XdrErrorCode =
  | "empty_input"
  | "input_too_large"
  | "invalid_base64"
  | "malformed_envelope"
  | "unsupported_envelope";

export interface MemoSummary {
  type: "none" | "text" | "id" | "hash" | "return";
  value: string | null;
}

export interface TimeBoundsSummary {
  minTime: string;
  maxTime: string;
}

export interface LedgerBoundsSummary {
  minLedger: number;
  maxLedger: number;
}

export interface PreconditionsSummary {
  timeBounds: TimeBoundsSummary | null;
  ledgerBounds: LedgerBoundsSummary | null;
  minSequenceNumber: string | null;
  minSequenceAge: string | null;
  minSequenceLedgerGap: number | null;
  extraSignerCount: number;
}

export interface FeeBumpSummary {
  feeSource: string;
  totalFee: string;
  outerSignatureCount: number;
}

export interface EnvelopeSummary {
  variant: EnvelopeVariant;
  sourceAccount: string;
  sequence: string;
  fee: string;
  memo: MemoSummary;
  preconditions: PreconditionsSummary;
  operationTypes: string[];
  signatureCount: number;
  /** Present only on fee-bump envelopes; the rest describes the inner transaction. */
  feeBump: FeeBumpSummary | null;
}

export interface XdrInput {
  envelope: string;
}
