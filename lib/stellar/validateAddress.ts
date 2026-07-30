import { StrKey } from "@stellar/stellar-sdk";

export type AddressValidationCode =
  | "empty"
  | "secret-key"
  | "muxed-account"
  | "invalid-prefix"
  | "invalid-characters"
  | "invalid-length"
  | "invalid-checksum"
  | "valid";

export interface AddressValidationResult {
  valid: boolean;
  code: AddressValidationCode;
  message: string;
}

const PUBLIC_KEY_LENGTH = 56;
const BASE32_BODY_PATTERN = /^[A-Z2-7]+$/;

// TODO(issue #16): Add broader unit test coverage for muxed-account and invalid-character edge cases.
export function validatePublicKey(value: string): AddressValidationResult {
  const address = value.trim();

  if (!address) {
    return {
      valid: false,
      code: "empty",
      message: "Enter a Stellar public address to validate it."
    };
  }

  if (address.startsWith("S")) {
    return {
      valid: false,
      code: "secret-key",
      message: "This looks like a secret key, not a public address. Secret keys start with S and must never be shared — enter the public address (starts with G) instead."
    };
  }

  if (address.startsWith("M")) {
    return {
      valid: false,
      code: "muxed-account",
      message: "This looks like a muxed account address (starts with M). It represents a shared account with a sub-identifier, not a plain public key, so it will not pass this check."
    };
  }

  if (!address.startsWith("G")) {
    return {
      valid: false,
      code: "invalid-prefix",
      message: `Stellar public addresses start with the letter G. This value starts with "${address[0]}", so it is not a valid public key.`
    };
  }

  const body = address.slice(1);

  if (!BASE32_BODY_PATTERN.test(body)) {
    return {
      valid: false,
      code: "invalid-characters",
      message: "Stellar addresses only use uppercase letters A–Z and digits 2–7. This value contains characters outside that set."
    };
  }

  if (address.length !== PUBLIC_KEY_LENGTH) {
    return {
      valid: false,
      code: "invalid-length",
      message: `Stellar public addresses are ${PUBLIC_KEY_LENGTH} characters long. This value has ${address.length}.`
    };
  }

  if (!StrKey.isValidEd25519PublicKey(address)) {
    return {
      valid: false,
      code: "invalid-checksum",
      message: "This address has the right length and prefix but fails Stellar's built-in checksum, so it was likely mistyped or copied incorrectly."
    };
  }

  return {
    valid: true,
    code: "valid",
    message: "This is a valid Stellar public address."
  };
}
