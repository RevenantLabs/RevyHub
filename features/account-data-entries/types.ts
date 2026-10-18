export interface AccountDataEntriesInput {
  accountId: string;
}

export type DecodedDataValue =
  | { kind: "text"; text: string; byteLength: number }
  | { kind: "bytes"; hex: string; byteLength: number }
  | { kind: "invalid_base64" };

export interface AccountDataEntry {
  key: string;
  rawBase64: string;
  decoded: DecodedDataValue;
}

export interface AccountDataEntries {
  accountId: string;
  entries: AccountDataEntry[];
}

export type AccountDataEntriesErrorCode =
  | "empty_input"
  | "invalid_address"
  | "account_not_found"
  | "rate_limited"
  | "request_failed";
