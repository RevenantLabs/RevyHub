export type ErrorCode =
  | "invalid_account"
  | "issuer_not_found"
  | "holder_not_found"
  | "no_trustline"
  | "rate_limited"
  | "request_failed";

export interface RawInput {
  issuerAccountId: string;
  holderAccountId: string;
  assetCode: string;
}

export interface ParsedInput {
  issuerAccountId: string;
  holderAccountId: string;
  assetCode: string;
}

/** The outcome of one of the two independent account fetches. */
export type FetchOutcome<T> = { ok: true; value: T } | { ok: false; code: ErrorCode };

export interface IssuerSignal {
  authClawbackEnabled: boolean;
}

export interface HolderSignal {
  clawbackEnabled: boolean;
}

export type EligibilityVerdict =
  | { kind: "eligible" }
  | { kind: "not_eligible" }
  | { kind: "disagreement"; issuerSaysEnabled: boolean; holderSaysEnabled: boolean }
  | { kind: "unknown" };

export interface ClawbackEligibilityReport {
  issuerAccountId: string;
  holderAccountId: string;
  assetCode: string;
  issuer: FetchOutcome<IssuerSignal>;
  holder: FetchOutcome<HolderSignal>;
  verdict: EligibilityVerdict;
}
