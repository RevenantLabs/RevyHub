export interface Sep7SignatureVerifierInput {
  uri: string;
  originDomain: string;
  signature: string;
  unsignedUri: string;
}

export interface Sep7SignatureVerifierResult {
  originDomain: string;
  tomlUrl: string;
  signingKey: string;
  verified: true;
}

export type Sep7SignatureVerifierErrorCode =
  | "empty_input"
  | "wrong_scheme"
  | "no_signature"
  | "no_origin_domain"
  | "toml_unreachable"
  | "no_signing_key"
  | "invalid_signing_key"
  | "signature_invalid"
  | "request_failed";
