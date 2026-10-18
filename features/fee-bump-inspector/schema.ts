import { err, ok, type Result } from "@/core/result/result";
import type {
  FeeBumpErrorCode,
  FeeBumpInput,
  InputRejectionReason
} from "@/features/fee-bump-inspector/types";

/**
 * Upper bound for pasted envelope text. A fee-bump envelope wrapping a classic
 * transaction is a few hundred bytes; the cap exists so a pasted file cannot
 * lock the main thread inside the decoder.
 */
export const MAX_ENVELOPE_LENGTH = 65_536;

/** Network passphrases are short sentences, not documents. */
export const MAX_PASSPHRASE_LENGTH = 256;

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

/** StrKey shape of an ed25519 secret seed, matched on the `S` prefix alone. */
const SECRET_SEED = /^S[A-Z2-7]{55}$/;

export interface RawFeeBumpInput {
  envelope: string;
  networkPassphrase: string;
}

/**
 * Validates both inputs before either reaches the SDK.
 *
 * The passphrase is checked here rather than inside the decoder because a
 * missing passphrase is not an XDR problem: the envelope may be perfectly
 * well-formed, and the hashes simply cannot be computed without knowing which
 * network the transaction was built for.
 */
export function parseFeeBumpInput({
  envelope: rawEnvelope,
  networkPassphrase: rawPassphrase
}: RawFeeBumpInput): Result<FeeBumpInput, FeeBumpErrorCode, InputRejectionReason> {
  const envelope = rawEnvelope.replace(/\s+/g, "");
  const networkPassphrase = rawPassphrase.trim();

  if (!envelope) return err("empty_input");
  if (envelope.length > MAX_ENVELOPE_LENGTH) return err("input_too_large");

  // Refused on the prefix alone, before any checksum work, so a pasted seed is
  // never decoded, echoed or stored anywhere in this slice. The reason is
  // carried as a detail rather than a code because the code list is fixed and
  // the UI needs to *clear the field*, not merely say something different.
  if (SECRET_SEED.test(envelope)) return err("invalid_input", "secret_key");

  if (envelope.length % 4 !== 0 || !BASE64.test(envelope)) return err("invalid_input");

  if (!networkPassphrase) return err("empty_passphrase");
  if (networkPassphrase.length > MAX_PASSPHRASE_LENGTH) return err("input_too_large");

  return ok({ envelope, networkPassphrase });
}
