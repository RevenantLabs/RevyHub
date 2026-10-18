import type { StellarNetwork } from "@/core/network/types";

export interface RawLedgerCloseCadenceForm {
  sampleSize: string;
}

export interface LedgerCloseCadenceInput {
  sampleSize: number;
}

export interface HorizonLedgerRecord {
  sequence?: number | string;
  closed_at?: string;
}

export interface ValidatedLedger {
  sequence: string;
  closedAt: string;
  closedAtMs: number;
}

export interface LedgerInterval {
  fromSequence: string;
  toSequence: string;
  fromClosedAt: string;
  toClosedAt: string;
  durationMs: number;
  unusual: boolean;
  repeatedTimestamp: boolean;
}

export interface SequenceGap {
  afterSequence: string;
  beforeSequence: string;
  missingCount: string;
}

export interface CadenceStats {
  medianMs: number;
  minMs: number;
  maxMs: number;
  intervalCount: number;
}

export interface LedgerCloseCadenceResult {
  network: StellarNetwork;
  requestedSampleSize: number;
  observedSampleSize: number;
  firstLedger: ValidatedLedger;
  lastLedger: ValidatedLedger;
  intervals: LedgerInterval[];
  stats: CadenceStats;
  sequenceGaps: SequenceGap[];
  malformedCount: number;
  repeatedTimestampCount: number;
}

export type LedgerCloseCadenceErrorCode =
  | "invalid_sample_size"
  | "malformed_ledger"
  | "history_unavailable"
  | "rate_limited"
  | "request_failed";

/** Inclusive bounds for the sample-size field. */
export const SAMPLE_SIZE_MIN = 2;
export const SAMPLE_SIZE_MAX = 200;

/** Intervals longer than this multiple of the median are flagged as unusual. */
export const UNUSUAL_INTERVAL_MEDIAN_MULTIPLE = 3;
