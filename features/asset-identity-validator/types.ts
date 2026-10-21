/** Classic asset-code tiers. Length picks the tier before any character check. */
export type CodeTier = "alphanum4" | "alphanum12";

export type AssetIdentityErrorCode =
  | "empty_code"
  | "invalid_code_length"
  | "invalid_code_characters"
  | "invalid_issuer"
  | "reserved_native_conflict";

/** Raw fields after whitespace normalisation. Never holds a secret seed. */
export interface AssetIdentityInput {
  code: string;
  issuer: string;
}

/**
 * A validated classic asset identity.
 *
 * `canonical` is the `code:issuer` string. This slice has no amounts, so
 * nothing here is a float or a BigInt balance.
 */
export interface AssetIdentity {
  code: string;
  issuer: string;
  tier: CodeTier;
  length: number;
  canonical: string;
}
