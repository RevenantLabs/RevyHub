import { err, ok, type Result } from "@/core/result/result";
import type { XdrErrorCode, XdrInput } from "@/features/xdr-inspector/types";

/**
 * Upper bound for pasted envelope text. Classic envelopes are far smaller, and
 * even large Soroban envelopes fit comfortably under 64 KiB of base64. The cap
 * exists so a pasted file cannot lock the main thread inside the decoder.
 */
export const MAX_XDR_LENGTH = 65_536;

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

/**
 * Validates the pasted text before it reaches the decoder.
 *
 * Rejecting non-base64 here rather than letting `fromXDR` throw is what lets
 * the UI distinguish "you pasted the wrong thing entirely" from "this is
 * base64, but not a transaction envelope" — two problems with different fixes.
 */
export function parseXdrInput(raw: string): Result<XdrInput, XdrErrorCode> {
  const envelope = raw.replace(/\s+/g, "");

  if (!envelope) return err("empty_input");
  if (envelope.length > MAX_XDR_LENGTH) return err("input_too_large");
  if (envelope.length % 4 !== 0 || !BASE64.test(envelope)) return err("invalid_base64");

  return ok({ envelope });
}
