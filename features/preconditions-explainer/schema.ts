import { err, ok, type Result } from "@/core/result/result";
import type {
  PreconditionsErrorCode,
  PreconditionsInput
} from "@/features/preconditions-explainer/types";

/**
 * Upper bound for pasted envelope text. Classic envelopes are far smaller and
 * even large Soroban envelopes fit well under 64 KiB of base64, so anything
 * longer is a pasted file rather than a transaction.
 */
export const MAX_XDR_LENGTH = 65_536;

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

/** A Stellar secret seed: `S` plus 55 base32 characters. */
const SECRET_SEED = /^S[A-Z2-7]{55}$/;

export function looksLikeSecretKey(value: string): boolean {
  return value.startsWith("S");
}

/**
 * Validates the pasted text before anything else touches it.
 *
 * The secret-key check comes first and matches on the `S` prefix alone. A
 * 56-character seed is base32, which is also valid base64 of a legal length —
 * without this guard a pasted secret would sail through the syntax check and
 * be handed to the XDR decoder. Rejecting it here means the value is never
 * decoded, never stored in state and never sent to Horizon.
 *
 * Everything that is not a decodable envelope collapses onto `invalid_xdr`,
 * because the fix is the same in every case: paste transaction-envelope XDR.
 */
export function parsePreconditionsInput(
  raw: string
): Result<PreconditionsInput, PreconditionsErrorCode> {
  const envelope = raw.replace(/\s+/g, "");

  if (!envelope) return err("empty_input");
  if (looksLikeSecretKey(envelope) && SECRET_SEED.test(envelope)) return err("invalid_xdr");
  if (envelope.length > MAX_XDR_LENGTH) return err("invalid_xdr");
  if (envelope.length % 4 !== 0 || !BASE64.test(envelope)) return err("invalid_xdr");

  return ok({ envelope });
}
