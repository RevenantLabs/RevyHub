import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  InputRejectionReason,
  SignatureHintAuditorErrorCode,
  SignatureHintAuditorInput
} from "@/features/signature-hint-auditor/types";

/**
 * Upper bound for pasted envelope text. Classic envelopes are far smaller;
 * the cap keeps a pasted file from locking the main thread inside the decoder.
 */
export const MAX_ENVELOPE_LENGTH = 65_536;

/** Optional public candidates — enough for a large multisig roster, not a dump. */
export const MAX_PUBLIC_SIGNERS = 64;

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

/** StrKey shape of an ed25519 secret seed, matched on the `S` prefix alone. */
const SECRET_SEED = /^S[A-Z2-7]{55}$/;

export interface RawSignatureHintAuditorInput {
  envelope: string;
  publicSigners: string;
}

/**
 * Splits the optional signer paste on newlines, commas and whitespace.
 *
 * Empty paste is allowed — the auditor still lists every decorated hint, just
 * with zero candidates. Secret seeds are refused before any checksum work so
 * they are never held in validated input.
 */
export function parsePublicSigners(
  raw: string
): Result<string[], SignatureHintAuditorErrorCode, InputRejectionReason> {
  const tokens = raw
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length > MAX_PUBLIC_SIGNERS) return err("too_many_signers");

  const publicSigners: string[] = [];

  for (const token of tokens) {
    if (SECRET_SEED.test(token)) return err("invalid_public_signer", "secret_key");
    if (!StrKey.isValidEd25519PublicKey(token)) return err("invalid_public_signer");
    publicSigners.push(token);
  }

  return ok(publicSigners);
}

/**
 * Validates the envelope and optional public keys before either reaches the SDK.
 */
export function parseSignatureHintAuditorInput({
  envelope: rawEnvelope,
  publicSigners: rawSigners
}: RawSignatureHintAuditorInput): Result<
  SignatureHintAuditorInput,
  SignatureHintAuditorErrorCode,
  InputRejectionReason
> {
  const envelope = rawEnvelope.replace(/\s+/g, "");

  if (!envelope) return err("empty_xdr");
  if (SECRET_SEED.test(envelope)) return err("invalid_xdr", "secret_key");
  if (envelope.length > MAX_ENVELOPE_LENGTH) return err("invalid_xdr");
  if (envelope.length % 4 !== 0 || !BASE64.test(envelope)) return err("invalid_xdr");

  const signers = parsePublicSigners(rawSigners);
  if (!signers.ok) return signers;

  return ok({ envelope, publicSigners: signers.value });
}
