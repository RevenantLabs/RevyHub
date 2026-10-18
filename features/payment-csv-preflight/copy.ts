import {
  MAX_CSV_LENGTH,
  MAX_FILE_BYTES,
  MAX_ROWS,
  OPTIONAL_HEADERS,
  REQUIRED_HEADERS
} from "@/features/payment-csv-preflight/schema";
import type { PreflightErrorCode, RowIssueCode } from "@/features/payment-csv-preflight/types";

const headerList = REQUIRED_HEADERS.join(", ");
const optionalList = OPTIONAL_HEADERS.join(", ");

export const copy = {
  formLabel: "Payment CSV",
  formHint: `First line is the header. Required columns: ${headerList}. Optional: ${optionalList}. Up to ${MAX_ROWS} payment rows. Never paste a secret key that starts with S.`,
  formPlaceholder: `${headerList}\nGABC...XYZ,10.5,XLM,`,
  fileLabel: "Or choose a CSV file",
  fileHint: `Read in your browser only, never uploaded. Up to ${Math.floor(MAX_FILE_BYTES / 1_000_000)} MB.`,
  submit: "Run preflight",
  reset: "Clear",
  loadingTitle: "Reading the file",
  loadingDescription: "Parsing and validating every row locally.",

  emptyTitle: "No payout file checked yet",
  emptyDescription:
    "Paste a CSV or choose a file above. Addresses, amounts and asset identities are checked in your browser — nothing is uploaded, signed or submitted.",

  summaryTitle: "Summary",
  summaryRows: "Payment rows",
  summaryValid: "Valid rows",
  summaryInvalid: "Invalid rows",
  summaryDuplicates: "Duplicate rows",
  summaryOptionalColumns: "Optional columns read",
  summaryOptionalColumnsNone: "None",
  summarySource: "Source",
  summaryOverview: "Overview",
  sourcePasted: "Pasted text",
  sourceFile: (name: string) => `File: ${name}`,
  overview: (valid: number, invalid: number, duplicates: number) =>
    `${valid} valid · ${invalid} invalid · ${duplicates} duplicate`,

  totalsTitle: "Totals by asset",
  totalsCaption: "Exact total of the valid rows for each full asset identity",
  columnAsset: "Asset",
  columnTotal: "Total",
  columnRows: "Rows",
  sameCodeWarningTitle: "Two different assets share a code in this file",
  sameCodeWarningDescription:
    "Totals are grouped by code and issuer together, never by code alone. Check that each row names the issuer you intend to pay against.",

  rowsTitle: "Rows",
  rowsCaption: "Every row in the order it appeared in the file",
  filterLabel: "Show rows",
  filterAll: "All rows",
  filterValid: "Valid only",
  filterInvalid: "Invalid only",
  filterEmpty: "No rows match this filter.",
  columnRow: "Row",
  columnDestination: "Destination",
  columnAmount: "Amount",
  columnStatus: "Status",
  columnAdvice: "What to fix",
  rowPosition: (index: number, line: number) => `${index} (line ${line})`,
  rowLabel: (index: number) => `row ${index} destination`,
  statusValid: "valid",
  statusInvalid: "invalid",
  statusDuplicate: "duplicate",
  rowValid: "Ready to pay.",
  secretRow: "Secret key — not shown",
  duplicateLines: (lines: number[]) =>
    `Same destination and asset as line${lines.length === 1 ? "" : "s"} ${lines.join(", ")}. Both rows are kept — remove one if it was not deliberate.`,
  assetUnresolved: "Unresolved asset",
  assetNative: "XLM (native)",

  exportTitle: "Export validated rows",
  exportDescription:
    "A local JSON copy of every row, with the exact per-asset totals. Nothing is signed or submitted.",
  exportAction: "Download JSON",
  exportLabel: "Validated rows as JSON",
  exportFilename: "payment-preflight.json",

  limitsTitle: "What this does not check",
  limitsDescription:
    "Every check here is offline and structural. This tool does not look at the network, so it cannot tell you whether a destination account exists, whether it holds a trustline for the asset, whether the issuer has authorised it, or whether the sending account can actually afford the totals. Confirm those before paying.",

  inputLimitHint: `Pasted text is capped at ${MAX_CSV_LENGTH.toLocaleString("en-US")} characters.`
} as const;

/**
 * One entry per row issue, each saying what to change in that row.
 *
 * Row problems are separate from the form-level error codes: a file with one
 * bad row is still worth reading in full, so these are advice attached to a
 * line rather than a reason to reject the import.
 */
export const rowIssueCopy: Record<RowIssueCode, string> = {
  wrong_column_count:
    "This row has a different number of columns than the header, so the values no longer line up. Check for an unquoted comma inside a value.",
  missing_destination: "The destination column is empty. Add the account that should receive the payment.",
  invalid_destination:
    "This is not a valid Stellar public address. Re-copy the whole G… or M… address; a single altered character breaks its checksum.",
  secret_key_destination:
    "This row held a secret key, which was discarded and never displayed. Replace it with the matching public address, and treat that key as compromised.",
  missing_amount: "The amount column is empty. Add the amount to pay in this asset.",
  invalid_amount:
    "The amount must be plain digits with an optional decimal point — no signs, spaces, thousands separators or exponents.",
  non_positive_amount: "The amount must be greater than zero. Remove the row instead of paying nothing.",
  too_many_decimals:
    "Stellar amounts carry at most 7 decimal places. Round the amount yourself rather than letting it be rounded for you.",
  amount_too_large: "The amount is larger than the protocol can represent. Split it across rows.",
  missing_asset_code: "The asset code is empty. Use XLM for lumens, or the issued asset's code.",
  invalid_asset_code: "An asset code is 1–12 letters or digits. Remove spaces and punctuation.",
  missing_asset_issuer:
    "An issued asset needs its issuer. Add the issuing account, or use XLM with an empty issuer for lumens.",
  invalid_asset_issuer:
    "The issuer is not a valid Stellar public address. Re-copy the issuing account's G… address.",
  unexpected_issuer_for_native: "Lumens have no issuer. Leave the asset_issuer column empty for XLM.",
  invalid_memo_type: "Memo type must be text, id, hash or return.",
  memo_value_without_type: "A memo value needs a memo type. Add one, or clear the value."
};

export const errorCopy: Record<PreflightErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Add a payout file first",
    description: "Paste CSV text or choose a file, then run the preflight again."
  },
  invalid_input: {
    title: "That file is not CSV text",
    description:
      "It contains bytes no text file has, so it is most likely a spreadsheet or a UTF-16 export. Re-save it as comma-separated UTF-8 text and try again."
  },
  input_too_large: {
    title: "That input is over the limit",
    description: `The whole file must stay under ${MAX_CSV_LENGTH.toLocaleString("en-US")} characters, ${Math.floor(MAX_FILE_BYTES / 1_000_000)} MB and ${MAX_ROWS.toLocaleString("en-US")} payment rows. Split the payout into smaller batches and check each one.`
  },
  invalid_csv: {
    title: "The CSV structure is malformed",
    description:
      "A quoted value was never closed, or a quote appeared part-way through a value. Wrap any value containing a comma in double quotes, and double a quote that is part of the text."
  },
  invalid_headers: {
    title: "The header line is wrong",
    description: `The first line must name every required column exactly once: ${headerList}. Optional columns are ${optionalList}. A repeated header is rejected rather than guessed at.`
  },
  invalid_rows: {
    title: "Export is blocked while rows are invalid",
    description:
      "Every row must pass before the file can be exported. Fix the rows listed below, or remove them, then run the preflight again."
  }
};
