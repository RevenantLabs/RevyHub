export interface SequenceInspectorInput {
  accountId: string;
  bumpTarget?: string;
}

export interface SequenceInspectorResult {
  accountId: string;
  sequence: string; // Current sequence number as string
  ledger: string; // The high 32 bits
  offset: string; // The low 32 bits
  nextSequence: string; // sequence + 1
  bumpTarget?: string; // Included if provided and valid
}

export type SequenceInspectorErrorCode =
  | "empty_input"
  | "invalid_address"
  | "invalid_bump_target"
  | "account_not_found"
  | "request_failed";
