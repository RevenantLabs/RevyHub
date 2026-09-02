export type ContractEventType = "contract" | "system" | "diagnostic";

export interface ContractEvent {
  id: string;
  ledger: number;
  closedAt: string | null;
  type: ContractEventType;
  contractId: string | null;
  topic: string[];
  value: string;
  successful: boolean;
}

export interface ContractEventsInput {
  contractId: string;
  startLedger: number;
  endLedger: number;
}

export interface ContractEventsResult {
  contractId: string;
  startLedger: number;
  endLedger: number;
  latestLedger: number;
  retentionWindow: number;
  events: ContractEvent[];
}

export type ContractEventsErrorCode =
  | "empty_contract_id"
  | "invalid_contract_id"
  | "invalid_ledger_range"
  | "range_outside_retention"
  | "no_events"
  | "rpc_error"
  | "request_failed";
