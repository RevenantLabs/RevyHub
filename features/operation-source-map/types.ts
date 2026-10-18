export type SourceMapErrorCode =
  | "empty_input"
  | "invalid_input"
  | "input_too_large"
  | "invalid_xdr"
  | "unsupported_envelope";

export type EnvelopeKind = "classic-v0" | "classic-v1" | "fee-bump";

/** Which rows the user has asked to see. */
export type SourceFilter = "all" | "inherited" | "overridden";

/**
 * Why an `invalid_input` was rejected, when the reason changes what the UI
 * must do rather than only what it says.
 *
 * `secret_key` is the only such reason: the pasted text has to be cleared from
 * the field, not merely refused.
 */
export type InputRejectionReason = "secret_key";

export interface AccountIdentity {
  /** Exactly what the envelope carries — an `M…` address stays an `M…` address. */
  address: string;
  /** The underlying `G…` account, present only when `address` is muxed. */
  baseAddress: string | null;
  muxedId: string | null;
}

export interface OperationSource {
  /** Zero-based position in the operations vector. */
  index: number;
  type: string;
  /** The operation's own source, when it declares one. */
  explicitSource: AccountIdentity | null;
  /** What will actually authorize this operation. */
  effectiveSource: AccountIdentity;
  /** True when the effective source came from the transaction, not the operation. */
  inherited: boolean;
}

export interface SourceGroup {
  source: AccountIdentity;
  /** Operation indexes, ascending — the order they appear in the envelope. */
  operationIndexes: number[];
  inheritedCount: number;
  overriddenCount: number;
}

export interface SourceMap {
  kind: EnvelopeKind;
  /** The transaction source every operation inherits unless it overrides it. */
  transactionSource: AccountIdentity;
  /**
   * The fee-bump fee source, when present.
   *
   * Deliberately not part of `groups`: it pays, it does not authorize any
   * operation.
   */
  feePayer: AccountIdentity | null;
  operations: OperationSource[];
  /** Grouped by effective source, first-appearance order. */
  groups: SourceGroup[];
  inheritedCount: number;
  overriddenCount: number;
}

export interface SourceMapInput {
  envelope: string;
}
