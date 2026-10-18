import { err, ok, type Result } from "@/core/result/result";
import type { DiffErrorCode, DiffInput } from "@/features/transaction-envelope-diff/types";

/** Upper bound per envelope, so a pasted file cannot reach the decoder. */
export const MAX_ENVELOPE_LENGTH = 65_536;

/** Network passphrases are short sentences, not documents. */
export const MAX_PASSPHRASE_LENGTH = 256;

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

/** StrKey shape of an ed25519 secret seed, matched on the `S` prefix alone. */
const SECRET_SEED = /^S[A-Z2-7]{55}$/;

export interface RawDiffInput {
  left: string;
  right: string;
  networkPassphrase: string;
}

/** Which side a shape problem came from, so the UI can point at the right field. */
export type DiffSide = "left" | "right";

function checkEnvelope(envelope: string, side: DiffSide): DiffErrorCode | null {
  if (envelope.length > MAX_ENVELOPE_LENGTH) return "input_too_large";
  if (SECRET_SEED.test(envelope)) return "invalid_input";
  if (envelope.length % 4 !== 0 || !BASE64.test(envelope)) {
    return side === "left" ? "invalid_left_xdr" : "invalid_right_xdr";
  }
  return null;
}

/**
 * Validates both sides independently.
 *
 * The two envelopes get their own error codes because a reviewer comparing a
 * wallet's output against their own almost always has exactly one of them
 * wrong, and "one of these is invalid" is not enough to act on.
 *
 * A missing passphrase is `empty_input` rather than an XDR error: both
 * envelopes may be perfectly fine, and the SDK simply cannot decode without
 * knowing which network they were built for.
 */
export function parseDiffInput({
  left: rawLeft,
  right: rawRight,
  networkPassphrase: rawPassphrase
}: RawDiffInput): Result<DiffInput, DiffErrorCode> {
  const left = rawLeft.replace(/\s+/g, "");
  const right = rawRight.replace(/\s+/g, "");
  const networkPassphrase = rawPassphrase.trim();

  if (!left || !right || !networkPassphrase) return err("empty_input");
  if (networkPassphrase.length > MAX_PASSPHRASE_LENGTH) return err("input_too_large");

  const leftProblem = checkEnvelope(left, "left");
  if (leftProblem) return err(leftProblem);

  const rightProblem = checkEnvelope(right, "right");
  if (rightProblem) return err(rightProblem);

  return ok({ left, right, networkPassphrase });
}

/** Reports which input field an error belongs to, for field-level messaging. */
export function sideFor(code: DiffErrorCode): DiffSide | null {
  if (code === "invalid_left_xdr") return "left";
  if (code === "invalid_right_xdr") return "right";
  return null;
}
