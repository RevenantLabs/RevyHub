export type PreflightErrorCode =
  | "empty_input"
  | "invalid_input"
  | "input_too_large"
  | "invalid_csv"
  | "invalid_headers"
  | "invalid_rows";

/**
 * What is wrong with one row.
 *
 * Row problems are deliberately *not* top-level error codes: a file with one
 * bad address is still worth showing in full, and failing the whole import
 * would hide the 499 rows that are fine.
 */
export type RowIssueCode =
  | "wrong_column_count"
  | "missing_destination"
  | "invalid_destination"
  | "secret_key_destination"
  | "missing_amount"
  | "invalid_amount"
  | "non_positive_amount"
  | "too_many_decimals"
  | "amount_too_large"
  | "missing_asset_code"
  | "invalid_asset_code"
  | "missing_asset_issuer"
  | "invalid_asset_issuer"
  | "unexpected_issuer_for_native"
  | "invalid_memo_type"
  | "memo_value_without_type";

export type RowFilter = "all" | "valid" | "invalid";

export interface AssetIdentity {
  /** `native`, or `CODE:ISSUER` — never the code on its own. */
  key: string;
  code: string;
  issuer: string | null;
  isNative: boolean;
}

export interface PaymentRow {
  /** 1-based line number in the original file, including the header line. */
  line: number;
  /** 1-based position among data rows, for display. */
  index: number;
  /** Empty when the destination was rejected and must not be echoed. */
  destination: string;
  amount: string;
  asset: AssetIdentity | null;
  memoType: string | null;
  memoValue: string | null;
  issues: RowIssueCode[];
  valid: boolean;
  /** Line numbers of other rows paying the same destination in the same asset. */
  duplicateOf: number[];
}

export interface AssetTotal {
  asset: AssetIdentity;
  /** Exact total of the valid rows in this asset, as a decimal string. */
  total: string;
  rowCount: number;
}

export interface PreflightReport {
  rows: PaymentRow[];
  totals: AssetTotal[];
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  /** Optional header columns that were present in the file. */
  optionalColumns: string[];
}

export interface PreflightInput {
  csv: string;
}

/** Where the checked text came from, so a result can name the file it read. */
export type PreflightSource = { kind: "text" } | { kind: "file"; name: string };
