import { err, ok, type Result } from "@/core/result/result";
import type {
  InputRejectionReason,
  SourceMapErrorCode,
  SourceMapInput
} from "@/features/operation-source-map/types";

/**
 * Upper bound for pasted envelope text. The cap exists so a pasted file cannot
 * lock the main thread inside the decoder.
 */
export const MAX_ENVELOPE_LENGTH = 65_536;

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

/** StrKey shape of an ed25519 secret seed, matched on the `S` prefix alone. */
const SECRET_SEED = /^S[A-Z2-7]{55}$/;

/**
 * Validates the pasted text before it reaches the decoder.
 *
 * Rejecting non-base64 here rather than letting `fromXDR` throw is what lets
 * the UI separate "you pasted the wrong thing entirely" from "this is base64,
 * but not a transaction envelope".
 */
export function parseSourceMapInput(
  raw: string
): Result<SourceMapInput, SourceMapErrorCode, InputRejectionReason> {
  const envelope = raw.replace(/\s+/g, "");

  if (!envelope) return err("empty_input");
  if (envelope.length > MAX_ENVELOPE_LENGTH) return err("input_too_large");

  // Refused on the prefix alone, before any decoding, so a pasted seed never
  // reaches the mapper. The reason is carried as a detail rather than a code
  // because the code list is fixed and the UI needs to *clear the field*.
  if (SECRET_SEED.test(envelope)) return err("invalid_input", "secret_key");

  if (envelope.length % 4 !== 0 || !BASE64.test(envelope)) return err("invalid_input");

  return ok({ envelope });
}
