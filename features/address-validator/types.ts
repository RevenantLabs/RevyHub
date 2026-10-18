/** Every StrKey shape this tool can recognise. */
export type AddressKind =
  | "ed25519_public_key"
  | "muxed_account"
  | "contract"
  | "ed25519_secret_seed"
  | "pre_auth_tx"
  | "sha256_hash"
  | "signed_payload"
  | "unknown";

export type AddressValidationCode =
  | "empty_input"
  | "secret_seed_rejected"
  | "unsupported_kind"
  | "unknown_prefix"
  | "bad_checksum_or_length"
  | "valid";

export interface AddressInput {
  address: string;
}

/** Every code except the success case. */
export type AddressErrorCode = Exclude<AddressValidationCode, "valid">;

interface AddressValidationShape {
  kind: AddressKind;
  /** The normalised address, or an empty string when it must not be echoed back. */
  address: string;
  length: number;
  prefix: string;
}

/**
 * A discriminated union, so `valid: false` narrows `code` to an error code and
 * the UI cannot be asked to render copy for a case that does not exist.
 */
export type AddressValidationResult =
  | (AddressValidationShape & { valid: true; code: "valid" })
  | (AddressValidationShape & { valid: false; code: AddressErrorCode });
