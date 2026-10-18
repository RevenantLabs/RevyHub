export type SnapshotErrorCode =
  | "empty_input"
  | "invalid_input"
  | "input_too_large"
  | "invalid_snapshot"
  | "account_mismatch";

/**
 * Which part of the account a change belongs to.
 *
 * Sections exist so a balance movement and a signer being added are never
 * mixed into one undifferentiated list — they call for completely different
 * follow-up.
 */
export type SnapshotSection =
  | "account"
  | "balances"
  | "signers"
  | "thresholds"
  | "flags"
  | "data";

export type ChangeType = "added" | "removed" | "changed" | "unchanged";

export type SectionFilter = "all" | SnapshotSection;
export type ChangeFilter = "all" | "changed" | "unchanged";

export interface SnapshotChange {
  section: SnapshotSection;
  /** Stable identity within the section — an asset, a signer key, a field name. */
  key: string;
  /** The field compared within that identity. */
  field: string;
  /** `null` means the field was absent, which is never the same as "0". */
  before: string | null;
  after: string | null;
  /**
   * Exact signed difference for amount fields, as a decimal string.
   * `null` for anything that is not an amount, or when either side is absent.
   */
  delta: string | null;
  type: ChangeType;
}

export interface SnapshotDiff {
  accountId: string;
  changes: SnapshotChange[];
  changedCount: number;
  unchangedCount: number;
  identical: boolean;
  /**
   * Top-level fields present in either snapshot that this tool does not model.
   *
   * Surfaced rather than dropped: a comparison that quietly ignores fields is
   * not a complete audit and must not look like one.
   */
  unsupportedFields: string[];
}

export interface SnapshotInput {
  before: string;
  after: string;
}
