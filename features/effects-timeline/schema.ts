import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  EffectsTimelineErrorCode,
  EffectsTimelineInput
} from "@/features/effects-timeline/types";

/**
 * Parses raw form input into a validated request.
 *
 * Whitespace is stripped entirely rather than trimmed, because addresses are
 * usually pasted out of wrapped terminal output. A value starting with `S` is
 * rejected on the prefix alone, before any checksum work, so a secret seed is
 * never carried into a request, into state, or back onto the screen.
 */
export function parseEffectsTimelineInput(
  raw: string
): Result<EffectsTimelineInput, EffectsTimelineErrorCode> {
  const accountId = raw.replace(/\s+/g, "");

  if (!accountId) return err("empty_input");
  if (accountId.startsWith("S")) return err("invalid_address");
  if (!StrKey.isValidEd25519PublicKey(accountId)) return err("invalid_address");

  return ok({ accountId });
}
