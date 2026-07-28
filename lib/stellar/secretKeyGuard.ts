import { StrKey } from "@stellar/stellar-sdk";

export const SECRET_KEY_WARNING =
  "This looks like a Stellar secret seed. Secret keys begin with S and must never be entered in public fields. If you need a new key, generate one using the Stellar Laboratory or CLI (stellar keys generate).";

export function detectSecretKey(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.length !== 56) {
    return false;
  }

  const candidate = trimmed.toUpperCase();
  return StrKey.isValidEd25519SecretSeed(candidate);
}
