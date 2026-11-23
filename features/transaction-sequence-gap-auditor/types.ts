import type { StellarNetwork } from "@/core/network/types";

export const PAGE_SIZE = 20;
export const MAX_PAGES = 5;
export const MAX_TRANSACTIONS = 100;
export const REQUEST_TIMEOUT_MS = 15_000;
export const INT64_MAX = 9_223_372_036_854_775_807n;

export interface RawAuditorForm {
  accountId: string;
}

export interface AuditorInput {
  accountId: string;
}

export interface SequenceEvidence {
  sequence: string;
  hash: string;
  successful: boolean;
  pagingToken: string;
  ledger: string;
  createdAt: string;
  pageIndex: number;
  operationCount?: number;
}

export type GapKind = "proved_bump" | "unexplained" | "unexplained_truncated";

export interface SequenceGap {
  afterSequence: string;
  beforeSequence: string;
  missingCount: string;
  kind: GapKind;
  afterHash: string;
  beforeHash: string;
  bumpTo?: string;
  bumpTransactionHash?: string;
}

export interface HistoryCoverage {
  network: StellarNetwork;
  accountId: string;
  pagesFetched: number;
  transactionCount: number;
  successfulCount: number;
  failedCount: number;
  oldestSequence: string | null;
  newestSequence: string | null;
  limitReached: boolean;
  incompleteEvidence: boolean;
  nextCursor: string | null;
}

export interface AuditorResult {
  coverage: HistoryCoverage;
  sequences: SequenceEvidence[];
  gaps: SequenceGap[];
  provedBumpCount: number;
  unexplainedCount: number;
  truncatedGapCount: number;
}

export interface HorizonTransactionRecord {
  hash?: unknown;
  paging_token?: unknown;
  source_account?: unknown;
  source_account_sequence?: unknown;
  successful?: unknown;
  ledger?: unknown;
  created_at?: unknown;
  operation_count?: unknown;
}

export interface HorizonOperationRecord {
  type?: unknown;
  source_account?: unknown;
  bump_to?: unknown;
}

export type ErrorCode =
  | "invalid_input"
  | "malformed_data"
  | "unsupported_variant"
  | "too_large"
  | "not_found"
  | "rate_limited"
  | "request_failed";

export type TransactionSequenceGapAuditorInput = AuditorInput;
export type TransactionSequenceGapAuditorResult = AuditorResult;
export type TransactionSequenceGapAuditorErrorCode = ErrorCode;
