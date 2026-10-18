export type FeeBumpErrorCode =
  | "empty_input"
  | "invalid_input"
  | "input_too_large"
  | "not_fee_bump"
  | "invalid_xdr"
  | "empty_passphrase";

/** Which of the two signable layers a value belongs to. */
export type LayerKind = "outer" | "inner";

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

export interface SignatureSummary {
  count: number;
  /** Four-byte signature hints, hex encoded, in envelope order. */
  hints: string[];
}

export interface OuterLayerSummary {
  feeSource: AccountIdentity;
  /** Maximum total fee bid by the fee-bump wrapper, in stroops. */
  maxFee: string;
  /** Transaction hash of the fee-bump transaction, hex encoded. */
  hash: string;
  signatures: SignatureSummary;
}

export interface InnerLayerSummary {
  source: AccountIdentity;
  sequence: string;
  /** Fee bid recorded inside the inner transaction, in stroops. */
  fee: string;
  operationCount: number;
  operationTypes: string[];
  /** Transaction hash of the inner transaction, hex encoded. */
  hash: string;
  signatures: SignatureSummary;
}

export interface FeeBidSummary {
  /** Outer bid in stroops — the ceiling the fee source accepts. */
  maxFee: string;
  /** Inner bid in stroops, kept for reference; it does not pay the fee bump. */
  innerFee: string;
  /**
   * Operations the network charges the fee bump for: every inner operation
   * plus one for the wrapper itself.
   */
  chargeableOperations: number;
  /** `maxFee / chargeableOperations`, floored — an integer stroop amount. */
  maxFeePerOperation: string;
}

export interface FeeBumpReport {
  networkPassphrase: string;
  outer: OuterLayerSummary;
  inner: InnerLayerSummary;
  feeBid: FeeBidSummary;
}

export interface FeeBumpInput {
  envelope: string;
  networkPassphrase: string;
}
