/** Which signature vector a decorated signature belongs to. */
export type SignatureGroup = "transaction" | "fee_bump_outer" | "fee_bump_inner";

export type EnvelopeVariant = "classic-v0" | "classic-v1" | "fee-bump";

/**
 * Expected failures for this offline auditor.
 *
 * A hint match is never treated as cryptographic proof — these codes cover
 * paste and decode problems only.
 */
export type SignatureHintAuditorErrorCode =
  | "empty_xdr"
  | "invalid_xdr"
  | "invalid_public_signer"
  | "unsupported_envelope"
  | "too_many_signers";

/**
 * Why `invalid_xdr` or `invalid_public_signer` was raised when the UI must
 * clear the offending field rather than leave a secret on screen.
 */
export type InputRejectionReason = "secret_key";

/** Zero, one, or many public candidates for a single four-byte hint. */
export type CandidateMatchKind = "none" | "single" | "collision";

export interface SignatureHintAuditorInput {
  envelope: string;
  /** Optional ed25519 public keys (`G…`) whose hints will be compared. */
  publicSigners: string[];
}

export interface DecoratedSignatureEntry {
  /** Zero-based position inside its group, preserving envelope order. */
  index: number;
  /** Four-byte signature hint, lowercase hex. */
  hint: string;
  group: SignatureGroup;
}

export interface PublicSignerHint {
  publicKey: string;
  /** Four-byte hint derived from the public key, lowercase hex. */
  hint: string;
}

export interface HintCandidateMatch {
  index: number;
  hint: string;
  group: SignatureGroup;
  candidates: string[];
  matchKind: CandidateMatchKind;
}

export interface SignatureGroupReport {
  group: SignatureGroup;
  signatures: HintCandidateMatch[];
}

export interface SignatureHintAuditorResult {
  variant: EnvelopeVariant;
  groups: SignatureGroupReport[];
  providedSigners: PublicSignerHint[];
  /** Hints that matched more than one provided public key. */
  collisionCount: number;
  /** Decorated hints with no provided candidate. */
  unmatchedCount: number;
  /** Decorated signatures across every group. */
  signatureCount: number;
}
