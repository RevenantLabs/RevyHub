import type { StellarNetwork } from "@/core/network/types";

export interface RawLedgerProtocolTransitionMapForm {
  startLedger: string;
  count: string;
}

export interface LedgerProtocolTransitionMapInput {
  startLedger: bigint;
  count: number;
}

export interface HorizonProtocolLedger {
  sequence?: number | string;
  protocol_version?: number | string;
  closed_at?: string;
  paging_token?: string;
}

export interface ProtocolLedger {
  sequence: string;
  protocolVersion: string;
  closedAt: string | null;
}

export interface ProtocolRun {
  protocolVersion: string;
  startSequence: string;
  endSequence: string;
  ledgerCount: string;
}

export type TransitionCertainty = "exact" | "uncertain";

export interface ProtocolTransition {
  fromVersion: string;
  toVersion: string;
  beforeSequence: string;
  afterSequence: string;
  certainty: TransitionCertainty;
  reason: "adjacent" | "sequence_gap" | "partial_page";
}

export interface SequenceGap {
  afterSequence: string;
  beforeSequence: string;
  missingCount: string;
}

export interface LedgerProtocolTransitionMapResult {
  network: StellarNetwork;
  startLedger: string;
  requestedCount: number;
  observedCount: number;
  endLedger: string;
  runs: ProtocolRun[];
  transitions: ProtocolTransition[];
  gaps: SequenceGap[];
  partialPage: boolean;
  summaryText: string;
}

export type LedgerProtocolTransitionMapErrorCode =
  | "invalid_start_ledger"
  | "invalid_count"
  | "history_unavailable"
  | "malformed_ledger"
  | "rate_limited"
  | "request_failed";

export const COUNT_MIN = 2;
export const COUNT_MAX = 200;
export const PAGE_LIMIT = 200;
