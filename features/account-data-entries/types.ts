export interface AccountDataEntriesInput {
  accountId: string;
}

export type AccountDataEntryDisplayType = 'text' | 'hex';

export interface AccountDataEntry {
  key: string;
  rawBase64: string;
  displayType: AccountDataEntryDisplayType;
  decodedValue: string;
  byteLength: number;
}

export interface AccountDataEntriesResult {
  entries: AccountDataEntry[];
}

export type AccountDataEntriesErrorCode = 
  | "empty_input" 
  | "invalid_account_id" 
  | "account_not_found" 
  | "request_failed";
