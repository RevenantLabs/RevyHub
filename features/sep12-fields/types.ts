/**
 * How SEP-9 describes the value of a field.
 *
 * These are the shapes the standard names, not validation rules: this tool
 * reports what the field is, and each anchor decides what it will accept.
 */
export type FieldType =
  | "string"
  | "date"
  | "country_code"
  | "language_code"
  | "binary"
  | "enum";

/** The three groups SEP-9 and SEP-12 organise the field set into. */
export type FieldGroup = "natural_person" | "organization" | "financial_account";

export interface Sep9Field {
  /** The canonical SEP-9 name. This is the string an anchor matches on. */
  name: string;
  group: FieldGroup;
  type: FieldType;
  description: string;
}

/**
 * The only way a search can fail.
 *
 * Searching a fixed local table cannot go wrong the way a request can, so this
 * slice deliberately has one error code rather than a speculative family of
 * them. A query large enough to be a pasted document is rejected before it is
 * scanned, which is the single input a user can realistically get wrong.
 */
export type Sep12FieldsErrorCode = "query_too_long";

export interface Sep12FieldsInput {
  query: string;
}

export interface FieldMatch {
  field: Sep9Field;
  /** True when the canonical name itself matched, not only the description. */
  nameMatch: boolean;
}

export interface FieldGroupResult {
  group: FieldGroup;
  matches: FieldMatch[];
}

export interface Sep12FieldsResult {
  query: string;
  totalFields: number;
  matchedFields: number;
  /** Only groups with at least one match are present. */
  groups: FieldGroupResult[];
}
