export interface SimulationExplainerInput {
  xdr: string;
}

export interface SimulationResourceUsage {
  cpuInstructions: string;
  memoryBytes: string;
  readBytes: string;
  writeBytes: string;
  ledgerReadEntries: number;
  ledgerWriteEntries: number;
  ledgerEntryReadBytes: string;
  ledgerEntryWriteBytes: string;
}

export interface SimulationAuthEntry {
  accountId: string | null;
  contractId: string | null;
  nonce: string | null;
  signatureArgs: string[];
}

export interface SimulationSuccess {
  kind: "success";
  latestLedger: number;
  minResourceFee: string;
  baseFee: string;
  resources: SimulationResourceUsage;
  authEntries: SimulationAuthEntry[];
  returnValue: string | null;
  events: string[];
}

export interface SimulationFailure {
  kind: "failure";
  errorCode: string;
  errorMessage: string;
}

export interface SimulationRestoreRequired {
  kind: "restore";
  minResourceFee: string;
  latestLedger: number;
}

export type SimulationExplainerResult =
  | SimulationSuccess
  | SimulationFailure
  | SimulationRestoreRequired;

export type SimulationExplainerErrorCode =
  | "empty_input"
  | "invalid_xdr"
  | "simulation_failed"
  | "restore_required"
  | "rpc_error"
  | "request_failed";
