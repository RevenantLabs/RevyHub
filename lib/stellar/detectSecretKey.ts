/**
 * Detects Stellar secret keys to prevent accidental exposure
 * when users paste a secret seed into a public-address field.
 *
 * Detection heuristics (fastpath, no crypto):
 * 1. Must start with 'S'
 * 2. Must be 56 characters (base32 encode of 32-byte seed + 2 checksum)
 * 3. Consists only of Stellar base32 characters (A-Z, 2-7)
 *
 * If all three pass, we fall through to full StrKey validation.
 *
 * Reference: Stellar SEP-0005 key encoding
 */
import { StrKey } from "@stellar/stellar-sdk";

const STELLAR_SECRET_LENGTH = 56;
const STELLAR_BASE32 = /^[A-Z2-7]+$/;

export interface SecretKeyDetection {
  detected: boolean;
  reason: string;
}

export function detectSecretKey(value: string): SecretKeyDetection {
  const trimmed = value.trim();

  // Fastpath: public keys start with 'G'
  if (trimmed.startsWith("G")) {
    return { detected: false, reason: "" };
  }

  // Secret seeds always start with 'S'
  if (!trimmed.startsWith("S")) {
    return { detected: false, reason: "" };
  }

  // Length check — Stellar secret seeds are always 56 chars
  if (trimmed.length !== STELLAR_SECRET_LENGTH) {
    return { detected: false, reason: "" };
  }

  // Character set check — base32 (A-Z, 2-7)
  if (!STELLAR_BASE32.test(trimmed)) {
    return { detected: false, reason: "" };
  }

  // Full cryptographic validation
  if (StrKey.isValidEd25519SecretSeed(trimmed)) {
    return {
      detected: true,
      reason:
        "This looks like a Stellar secret key. Never share your secret key! " +
        "Public addresses start with 'G' — use those instead.",
    };
  }

  return { detected: false, reason: "" };
}
