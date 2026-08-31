export interface SequenceInspectorInput {
  accountId: string;
  bumpTarget?: string;
}

export interface SequenceInspectorResult {
  accountId: string;
  currentSequence: bigint;
  nextSequence: bigint | null;
  creationLedger: bigint;
  offset: bigint;
  creationLedgerMaximum: bigint;
  sequenceUpdatedLedger: bigint;
  bumpTarget?: bigint;
  bumpIncrease?: bigint;
  bumpChangesLedgerPrefix?: boolean;
}

export interface HorizonSequenceAccount {
  account_id: string;
  sequence: string;
  sequence_ledger: number | string;
}

export type SequenceInspectorErrorCode =
  | "empty_input"
  | "invalid_address"
  | "invalid_bump_target"
  | "account_not_found"
  | "request_failed";
