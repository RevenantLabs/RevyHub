export type DiffErrorCode =
  | "empty_input"
  | "invalid_input"
  | "input_too_large"
  | "invalid_left_xdr"
  | "invalid_right_xdr";

export type EnvelopeKind = "classic-v0" | "classic-v1" | "fee-bump";

/**
 * Which part of the envelope a field belongs to.
 *
 * `signatures` is deliberately its own section: a re-signed but otherwise
 * identical transaction is a very different review outcome from one whose
 * amount moved, and lumping them together hides that.
 */
export type DiffSection = "envelope" | "body" | "operations" | "signatures";

/** Which layer of a fee-bump envelope a field came from. */
export type DiffLayer = "envelope" | "outer" | "inner";

export type DiffStatus = "unchanged" | "changed" | "added" | "removed";

/** Which rows the user has asked to see. */
export type DiffFilter = "all" | "changed" | "unchanged";

export interface FieldValue {
  value: string;
  section: DiffSection;
  layer: DiffLayer;
}

/** A stable, sortable map of field path to value. */
export type FieldMap = Map<string, FieldValue>;

export interface DiffEntry {
  /** Stable dotted path, e.g. `inner.operations[0].amount`. */
  path: string;
  section: DiffSection;
  layer: DiffLayer;
  /** `null` when the field does not exist on that side. */
  before: string | null;
  after: string | null;
  status: DiffStatus;
}

export interface DiffSummary {
  leftKind: EnvelopeKind;
  rightKind: EnvelopeKind;
  networkPassphrase: string;
  entries: DiffEntry[];
  changedCount: number;
  unchangedCount: number;
  /** True when nothing at all differs, including the signatures. */
  identical: boolean;
  /** True when only the `signatures` section differs. */
  signaturesOnly: boolean;
}

export interface DiffInput {
  left: string;
  right: string;
  networkPassphrase: string;
}
