import type { StellarNetwork } from "@/core/network/types";

export type RawInput = Record<string, string>;

export type ErrorCode =
  | "invalid_contract_id"
  | "entry_missing"
  | "entry_archived"
  | "malformed_entry"
  | "entry_oversized"
  | "request_failed";

export interface LedgerMarker {
  latestLedger: number;
  lastModifiedLedgerSeq: number | null;
  liveUntilLedgerSeq: number | null;
}

export interface InstanceView {
  kind: "wasm" | "builtin";
  hash: string | null;
  marker: LedgerMarker;
}

export interface CodeView {
  size: number;
  hash: string;
  marker: LedgerMarker;
}

export interface HashReport {
  contractId: string;
  network: StellarNetwork;
  instance: InstanceView;
  code: CodeView | null;
  verdict: "match" | "mismatch" | "not_applicable";
  atomic: boolean;
}

export interface LedgerRow {
  key?: string;
  xdr: string;
  lastModifiedLedgerSeq?: number;
  liveUntilLedgerSeq?: number;
}

export interface LedgerResult {
  entries: LedgerRow[];
  latestLedger: number;
}
