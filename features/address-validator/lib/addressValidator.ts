import { StrKey } from "@stellar/stellar-sdk";
import type {
  AddressInput,
  AddressKind,
  AddressValidationResult
} from "@/features/address-validator/types";

/**
 * Maps a StrKey prefix letter to the kind of value it encodes.
 * See SEP-0023 for the version-byte table these prefixes come from.
 */
const PREFIX_KINDS: Record<string, AddressKind> = {
  G: "ed25519_public_key",
  M: "muxed_account",
  C: "contract",
  S: "ed25519_secret_seed",
  T: "pre_auth_tx",
  X: "sha256_hash",
  P: "signed_payload"
};

/**
 * Checksum check per kind.
 *
 * The SDK exposes `isValid*` helpers for only some version bytes, so the rest
 * are verified by attempting to decode them: a decoder throws on a bad
 * checksum or length, which is exactly the check we need.
 */
const VALIDATORS: Partial<Record<AddressKind, (value: string) => boolean>> = {
  ed25519_public_key: (value) => StrKey.isValidEd25519PublicKey(value),
  muxed_account: (value) => StrKey.isValidMed25519PublicKey(value),
  contract: (value) => StrKey.isValidContract(value),
  signed_payload: (value) => StrKey.isValidSignedPayload(value),
  pre_auth_tx: (value) => decodes(() => StrKey.decodePreAuthTx(value)),
  sha256_hash: (value) => decodes(() => StrKey.decodeSha256Hash(value))
};

function decodes(decode: () => unknown): boolean {
  try {
    decode();
    return true;
  } catch {
    return false;
  }
}

export function detectKind(address: string): AddressKind {
  return PREFIX_KINDS[address[0]?.toUpperCase() ?? ""] ?? "unknown";
}

/**
 * Validates a Stellar address.
 *
 * A secret seed is never echoed back and never checksum-verified: recognising
 * the `S` prefix is enough to reject it, and repeating the value on screen
 * would be the exact leak this tool exists to prevent.
 */
export function validateAddress({ address }: AddressInput): AddressValidationResult {
  const kind = detectKind(address);
  const prefix = address[0]?.toUpperCase() ?? "";
  const base = { kind, length: address.length, prefix };

  if (kind === "ed25519_secret_seed") {
    return { ...base, valid: false, code: "secret_seed_rejected", address: "" };
  }

  if (kind === "unknown") {
    return { ...base, valid: false, code: "unknown_prefix", address };
  }

  const wellFormed = VALIDATORS[kind]?.(address) ?? false;

  if (kind !== "ed25519_public_key") {
    return {
      ...base,
      valid: false,
      code: wellFormed ? "unsupported_kind" : "bad_checksum_or_length",
      address
    };
  }

  if (!wellFormed) {
    return { ...base, valid: false, code: "bad_checksum_or_length", address };
  }

  return { ...base, valid: true, code: "valid", address };
}
