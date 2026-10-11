export type ThresholdLevel = "low" | "medium" | "high";

export interface MultisigSigner {
  key: string;
  weight: string;
  type: string;
  isMaster: boolean;
}

export interface MultisigThresholds {
  low: string;
  medium: string;
  high: string;
}

export interface MultisigOperationResult {
  index: number;
  type: string;
  sourceAccount: string;
  requiredThreshold: ThresholdLevel;
  requiredWeight: string;
  availableWeight: string;
  shortfallWeight: string;
  canBeMet: boolean;
  attributedSignatures: string[];
  unattributedSignatures: string[];
  missingSigners: MultisigSigner[];
}

export interface MultisigAnalyzerInput {
  envelope: string;
  sourceAccount: string;
}

export interface MultisigAnalyzerResult {
  sourceAccount: string;
  transactionSourceAccount: string;
  requiredThreshold: ThresholdLevel;
  requiredWeight: string;
  signatureWeight: string;
  availableWeight: string;
  shortfallWeight: string;
  missingSigners: MultisigSigner[];
  unattributedSignatures: string[];
  signers: MultisigSigner[];
  thresholds: MultisigThresholds;
  operations: MultisigOperationResult[];
}

export type MultisigAnalyzerErrorCode =
  | "empty_input"
  | "invalid_xdr"
  | "account_not_found"
  | "signer_lookup_failed"
  | "rate_limited"
  | "request_failed";
