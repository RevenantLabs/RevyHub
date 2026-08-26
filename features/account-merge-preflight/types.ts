export interface AccountMergePreflightInput {
  source: string;
  destination: string;
}

export interface BlockingItem {
  type: "trustline" | "offer" | "data_entry" | "sponsorship" | "signer";
  description: string;
}

export interface AccountMergePreflightResult {
  isMergeable: boolean;
  transferableXlm: string;
  blockingItems: BlockingItem[];
}

export type AccountMergePreflightErrorCode =
  | "empty_source"
  | "invalid_source"
  | "empty_destination"
  | "invalid_destination"
  | "same_account"
  | "source_not_found"
  | "destination_not_found"
  | "request_failed";
