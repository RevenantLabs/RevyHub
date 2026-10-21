import { StrKey } from "@stellar/stellar-sdk";
import type { PublicStrKeyKind } from "@/features/strkey-corruption-locator/types";

/**
 * SEP-0023 / RFC 4648 base32 alphabet used by Stellar StrKey.
 * Checksums themselves stay inside `StrKey`; this module only names the alphabet and version bytes.
 */
export const STRKEY_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export const STRKEY_ALPHABET_CHARACTERS = [...STRKEY_ALPHABET] as readonly string[];

/**
 * Lengths accepted by `@stellar/stellar-sdk` StrKey before it even verifies the CRC.
 * Tests re-encode sample keys so these cannot drift from the SDK.
 */
export const MIN_STRKEY_LENGTH = 56;
export const MUXED_STRKEY_LENGTH = 69;
export const MAX_STRKEY_LENGTH = 165;

const SECRET_VERSION = "ed25519SecretSeed";

export type StrKeyVersionName = PublicStrKeyKind | typeof SECRET_VERSION;

const VERSION_NAMES: readonly StrKeyVersionName[] = [
  "ed25519PublicKey",
  "ed25519SecretSeed",
  "med25519PublicKey",
  "preAuthTx",
  "sha256Hash",
  "signedPayload",
  "contract"
];

type VersionLookup = {
  getVersionByteForPrefix(prefix: string): string | undefined;
};

/**
 * Reads the SDK's prefix-to-version-byte table.
 * Only the first character is passed in, so a secret seed is never handed to the decoder.
 */
export function versionByteName(value: string): StrKeyVersionName | null {
  const prefix = value[0]?.toUpperCase();
  if (!prefix) return null;

  const name = (StrKey as unknown as VersionLookup).getVersionByteForPrefix(prefix);
  if (name && VERSION_NAMES.includes(name as StrKeyVersionName)) return name as StrKeyVersionName;
  return null;
}

/** True when the leading version byte is an Ed25519 secret seed (`S...`). */
export function isSecretSeedShaped(value: string): boolean {
  return versionByteName(value) === SECRET_VERSION;
}

export function isSearchableLength(length: number): boolean {
  return length >= MIN_STRKEY_LENGTH && length <= MAX_STRKEY_LENGTH;
}

function decodes(decode: () => unknown): boolean {
  try {
    decode();
    return true;
  } catch {
    return false;
  }
}

/**
 * Classifies a public StrKey whose checksum the SDK accepts.
 * Secret seeds return null without a checksum check, so they are never decoded.
 */
export function classifyPublicStrKey(value: string): PublicStrKeyKind | null {
  const version = versionByteName(value);
  if (!version || version === SECRET_VERSION) return null;

  switch (version) {
    case "ed25519PublicKey":
      return StrKey.isValidEd25519PublicKey(value) ? version : null;
    case "med25519PublicKey":
      return StrKey.isValidMed25519PublicKey(value) ? version : null;
    case "contract":
      return StrKey.isValidContract(value) ? version : null;
    case "signedPayload":
      return StrKey.isValidSignedPayload(value) ? version : null;
    case "preAuthTx":
      return decodes(() => StrKey.decodePreAuthTx(value)) ? version : null;
    case "sha256Hash":
      return decodes(() => StrKey.decodeSha256Hash(value)) ? version : null;
    default:
      return null;
  }
}
