export interface SorobanAuthInspectorInput {
  xdr: string;
}

export interface AuthInvocationNode {
  contractId: string | null;
  functionName: string;
  args: string[];
  subInvocations: AuthInvocationNode[];
}

export interface SourceAccountCredentials {
  kind: "sourceAccount";
}

export interface AddressCredentials {
  kind: "address";
  accountId: string | null;
  contractId: string | null;
  nonce: string;
  signatureExpirationLedger: number;
}

export type AuthCredentials = SourceAccountCredentials | AddressCredentials;

export interface AuthEntry {
  credentials: AuthCredentials;
  rootInvocation: AuthInvocationNode;
}

export interface SorobanAuthInspectorAuthResult {
  kind: "auth";
  entries: AuthEntry[];
}

export interface SorobanAuthInspectorNoAuthResult {
  kind: "no_authorization";
}

export type SorobanAuthInspectorResult =
  | SorobanAuthInspectorAuthResult
  | SorobanAuthInspectorNoAuthResult;

export type SorobanAuthInspectorErrorCode =
  | "empty_input"
  | "invalid_base64"
  | "invalid_xdr"
  | "not_soroban"
  | "no_authorization"
  | "auth_unreadable";
