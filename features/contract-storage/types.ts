export interface ContractStorageInput {
  contractId: string;
}

export type StorageEntryKind = "instance" | "persistent" | "temporary";

export interface StorageEntry {
  key: string;
  value: string;
  kind: StorageEntryKind;
  liveUntilLedger: number | null;
  ledgersRemaining: number | null;
}

export interface ContractStorageResult {
  contractId: string;
  latestLedger: number;
  ledgerCloseTimeMs: number | null;
  entries: StorageEntry[];
}

/** Backward-compatible alias for code that still references the old name. */
export type ContractStorageData = ContractStorageResult;

export type ContractStorageErrorCode =
  | "empty_contract_id"
  | "invalid_contract_id"
  | "contract_not_found"
  | "rpc_error"
  | "request_failed";
