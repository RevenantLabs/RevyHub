import type { StellarNetwork } from "@/core/network/types";

export type Durability = "persistent" | "temporary";

export type ErrorCode =
  | "invalid_contract_id"
  | "invalid_storage_key"
  | "entry_not_found"
  | "history_unavailable"
  | "rate_limited"
  | "request_failed";

/** Raw, unvalidated form input. */
export interface RawInput {
  contractId: string;
  storageKeyXdr: string;
  durability: string;
}

/** Input once validated by `schema.ts`. */
export interface ParsedInput {
  contractId: string;
  storageKeyXdr: string;
  durability: Durability;
}

export interface LedgerRow {
  key?: string;
  xdr: string;
  lastModifiedLedgerSeq?: number;
  /** Absent for a row the RPC's archive layer returned with no current TTL. */
  liveUntilLedgerSeq?: number;
}

export interface LedgerResult {
  entries: LedgerRow[];
  latestLedger: number;
}

export type LivenessState =
  | { kind: "live"; liveUntilLedgerSeq: number }
  | { kind: "pending_eviction"; liveUntilLedgerSeq: number }
  | { kind: "archived" }
  | { kind: "expired_temporary" };

export interface RestoreInfo {
  restorable: true;
  explanation: string;
}

export interface NotRestorableInfo {
  restorable: false;
  explanation: string;
}

export type RestoreRequirement = RestoreInfo | NotRestorableInfo;

export interface ReadinessReport {
  contractId: string;
  storageKeyXdr: string;
  durability: Durability;
  network: StellarNetwork;
  latestLedger: number;
  liveness: LivenessState;
  restore: RestoreRequirement;
}
