/** Public StrKey version-byte names exposed by the Stellar SDK. Secret seeds are not a result kind. */
export type PublicStrKeyKind =
  | "ed25519PublicKey"
  | "med25519PublicKey"
  | "contract"
  | "preAuthTx"
  | "sha256Hash"
  | "signedPayload";

export interface StrkeyCorruptionLocatorInput {
  /** Whitespace-stripped text that is safe to run through substitution search. */
  value: string;
}

/**
 * One alphabet substitution that makes the SDK checksum succeed.
 * Positions are zero-based indexes into the submitted string.
 */
export interface CorrectionCandidate {
  position: number;
  originalCharacter: string;
  replacement: string;
  corrected: string;
  kind: PublicStrKeyKind;
}

export interface CandidateReport {
  outcome: "candidates";
  length: number;
  totalCandidates: number;
  candidates: CorrectionCandidate[];
}

export interface NoCandidateReport {
  outcome: "no_candidates";
  code: "no_candidates_found";
  length: number;
}

export type StrkeyCorruptionLocatorResult = CandidateReport | NoCandidateReport;

export type StrkeyCorruptionLocatorErrorCode =
  | "empty_input"
  | "already_valid"
  | "contains_secret_seed"
  | "invalid_length"
  | "no_candidates_found"
  | "too_long";
