export type SignerType =
  | "ed25519_public_key"
  | "sha256_hash"
  | "preauth_tx"
  | "ed25519_signed_payload";

export type ThresholdLevel = "low" | "medium" | "high";

export interface AccountSigner {
  key: string;
  weight: string;
  type: SignerType;
  isMaster: boolean;
}

export interface AccountThresholds {
  low: string;
  medium: string;
  high: string;
}

export interface ThresholdAssessment {
  level: ThresholdLevel;
  requiredWeight: string;
  availableWeight: string;
  canBeMet: boolean;
}

export interface AccountSignersResult {
  accountId: string;
  signers: AccountSigner[];
  thresholds: AccountThresholds;
  thresholdAssessments: ThresholdAssessment[];
  totalWeight: string;
  isNormalSingleSigner: boolean;
  isMultisig: boolean;
  masterKeyDisabled: boolean;
}

export interface AccountSignersInput {
  accountId: string;
}

export type AccountSignersErrorCode =
  | "empty_input"
  | "invalid_address"
  | "account_not_found"
  | "rate_limited"
  | "request_failed";
