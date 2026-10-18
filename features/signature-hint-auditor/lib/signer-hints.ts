import { Keypair, StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { hintToHex } from "@/features/signature-hint-auditor/lib/decorated-signatures";
import type {
  PublicSignerHint,
  SignatureHintAuditorErrorCode
} from "@/features/signature-hint-auditor/types";

/**
 * Derives the four-byte signature hint from an ed25519 public key.
 *
 * Secret seeds are never accepted here — callers must validate with StrKey
 * first. The hint is the last four bytes of the raw public key, identical to
 * what the network stores on a decorated signature.
 */
export function deriveSignerHint(
  publicKey: string
): Result<PublicSignerHint, SignatureHintAuditorErrorCode> {
  if (!StrKey.isValidEd25519PublicKey(publicKey)) {
    return err("invalid_public_signer");
  }

  const keypair = Keypair.fromPublicKey(publicKey);
  return ok({
    publicKey,
    hint: hintToHex(keypair.signatureHint())
  });
}

/** Maps every provided public key to its hint, preserving paste order. */
export function deriveSignerHints(
  publicKeys: string[]
): Result<PublicSignerHint[], SignatureHintAuditorErrorCode> {
  const hints: PublicSignerHint[] = [];

  for (const publicKey of publicKeys) {
    const derived = deriveSignerHint(publicKey);
    if (!derived.ok) return derived;
    hints.push(derived.value);
  }

  return ok(hints);
}
