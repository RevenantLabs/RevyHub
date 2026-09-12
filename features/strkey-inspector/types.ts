/** Supported public StrKey kinds. */
export type StrKeyKind =
  | "ed25519_public_key"
  | "muxed_account"
  | "contract"
  | "pre_auth_tx"
  | "sha256_hash"
  | "signed_payload";

export interface StrkeyInspectorInput {
  value: string;
}

export interface StrkeyInspectorResult {
  kind: StrKeyKind;
  prefix: string;
  strkey: string;
  rawBytesHex: string;
  byteLength: number;
  muxedGAddress?: string;
  muxedId?: string;
}

export type StrkeyInspectorErrorCode =
  | "empty_input"
  | "secret_seed_rejected"
  | "unknown_prefix"
  | "bad_checksum"
  | "request_failed";
