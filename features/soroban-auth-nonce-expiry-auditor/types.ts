export type AuditErrorCode = "invalid_input" | "malformed_data" | "unsupported_variant" | "too_large";
export interface AuditInput { entries: string[]; networkPassphrase: string; evaluationLedger: number | null }
export type ExpiryStatus = "ready" | "expired" | "unknown";
export interface AuditRow {
  index: number;
  credential: "source-account" | "address";
  address: string | null;
  nonce: string | null;
  expirationLedger: number | null;
  expiry: ExpiryStatus;
  signaturePayloadPresent: boolean | null;
  signatureValidity: "unknown";
  onChainNonceAvailability: "unknown";
}
export interface NonceReuse { address: string; networkPassphrase: string; nonce: string; entryIndices: number[] }
export interface AuditResult {
  networkPassphrase: string;
  evaluationLedger: number | null;
  rows: AuditRow[];
  reuse: NonceReuse[];
  incompleteEvidence: boolean;
  provenance: "user-pasted-xdr";
}
