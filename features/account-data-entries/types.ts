export interface AccountDataEntriesInput {
  accountId: string;
}

export interface TextAccountDataValue {
  kind: "text";
  text: string;
  byteLength: number;
}

export interface BytesAccountDataValue {
  kind: "bytes";
  hex: string;
  byteLength: number;
}

export interface InvalidAccountDataValue {
  kind: "invalid_base64";
}

export type AccountDataValue =
  | TextAccountDataValue
  | BytesAccountDataValue
  | InvalidAccountDataValue;

export interface AccountDataEntry {
  key: string;
  rawBase64: string;
  value: AccountDataValue;
}

export interface AccountDataEntriesResult {
  accountId: string;
  entries: AccountDataEntry[];
}

export type AccountDataEntriesErrorCode =
  | "empty_input"
  | "invalid_address"
  | "account_not_found"
  | "rate_limited"
  | "request_failed";
