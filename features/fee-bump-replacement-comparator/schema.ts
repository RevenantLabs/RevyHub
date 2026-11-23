import { err, ok, type Result } from "@/core/result/result";
import type {
  DecodeRejectionDetail,
  EnvelopeSide,
  FeeBumpReplacementComparatorErrorCode,
  FeeBumpReplacementComparatorInput
} from "@/features/fee-bump-replacement-comparator/types";

/** Upper bound per envelope so a pasted file cannot reach the decoder. */
export const MAX_ENVELOPE_LENGTH = 65_536;

/** Network passphrases are short sentences, not documents. */
export const MAX_PASSPHRASE_LENGTH = 256;

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

/** StrKey shape of an ed25519 secret seed, matched on the `S` prefix alone. */
const SECRET_SEED = /^S[A-Z2-7]{55}$/;

export interface RawFeeBumpReplacementComparatorInput {
  left: string;
  right: string;
  networkPassphrase: string;
}

function checkEnvelope(
  envelope: string,
  side: EnvelopeSide
): Result<string, FeeBumpReplacementComparatorErrorCode, DecodeRejectionDetail> {
  if (envelope.length > MAX_ENVELOPE_LENGTH) return err("too_large");
  if (SECRET_SEED.test(envelope)) return err("invalid_input", "secret_key");
  if (envelope.length % 4 !== 0 || !BASE64.test(envelope)) {
    return err("invalid_input", side);
  }
  return ok(envelope);
}

/**
 * Validates both fee-bump envelopes and the passphrase before either reaches
 * the SDK.
 *
 * A missing passphrase is `empty_input` rather than an XDR error: both
 * envelopes may be perfectly fine, and the inner hashes simply cannot be
 * computed without knowing which network they were built for.
 */
export function parseFeeBumpReplacementComparatorInput({
  left: rawLeft,
  right: rawRight,
  networkPassphrase: rawPassphrase
}: RawFeeBumpReplacementComparatorInput): Result<
  FeeBumpReplacementComparatorInput,
  FeeBumpReplacementComparatorErrorCode,
  DecodeRejectionDetail
> {
  const left = rawLeft.replace(/\s+/g, "");
  const right = rawRight.replace(/\s+/g, "");
  const networkPassphrase = rawPassphrase.trim();

  if (!left || !right || !networkPassphrase) return err("empty_input");
  if (networkPassphrase.length > MAX_PASSPHRASE_LENGTH) return err("too_large");

  const leftProblem = checkEnvelope(left, "left");
  if (!leftProblem.ok) return leftProblem;

  const rightProblem = checkEnvelope(right, "right");
  if (!rightProblem.ok) return rightProblem;

  return ok({ left, right, networkPassphrase });
}

/** Reports which input field an error belongs to, for field-level messaging. */
export function sideFor(
  code: FeeBumpReplacementComparatorErrorCode,
  detail?: DecodeRejectionDetail
): EnvelopeSide | null {
  if (detail === "left" || detail === "right") return detail;
  if (code === "malformed_data" || code === "unsupported_variant") {
    return detail === "left" || detail === "right" ? detail : null;
  }
  return null;
}
