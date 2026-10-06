/**
 * Every way the pasted text can fail to be a Horizon collection response.
 *
 * These are deliberately separate codes rather than a single invalid_input:
 * "you pasted something that is not JSON", "you pasted JSON that is not an
 * object" and "you pasted a Horizon object with no records" are three
 * different mistakes with three different fixes.
 */
export type PaginationErrorCode =
  | "empty_input"
  | "input_too_large"
  | "not_json"
  | "not_an_object"
  | "missing_records"
  | "records_not_an_array";

export interface PaginationInspectorInput {
  text: string;
}

export interface QueryParameter {
  name: string;
  value: string;
}

export interface LinkSummary {
  href: string;
  /**
   * The cursor query parameter, kept as an opaque string.
   *
   * Horizon cursors are never treated as numbers anywhere in this slice. A
   * cursor is a token a server handed out; the only sound operations on it are
   * "use it verbatim in the next request" and "compare it for equality with
   * another token".
   */
  cursor: string | null;
  params: QueryParameter[];
}

/** How the paging_token values in this page relate to one another. */
export type TokenOrder = "increasing" | "not_increasing" | "undetermined" | "none";

export interface DuplicateIdentifier {
  key: string;
  /** Zero-based positions of every record carrying this identifier. */
  indexes: number[];
}

export interface PaginationInspection {
  recordCount: number;
  /** False when the envelope has no _links object at all. */
  hasLinksObject: boolean;
  next: LinkSummary | null;
  prev: LinkSummary | null;
  /** Records carrying neither paging_token nor id. */
  missingIdentifiers: number[];
  /** Records whose paging_token is absent or not a plain decimal integer. */
  nonNumericTokens: number[];
  duplicates: DuplicateIdentifier[];
  tokenOrder: TokenOrder;
}
