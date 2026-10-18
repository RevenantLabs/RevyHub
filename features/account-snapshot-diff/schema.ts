import { err, ok, type Result } from "@/core/result/result";
import type { SnapshotErrorCode, SnapshotInput } from "@/features/account-snapshot-diff/types";

/**
 * Upper bound per snapshot. A Horizon account resource with hundreds of
 * trustlines is still well under this; the cap exists so a pasted file cannot
 * lock the main thread inside `JSON.parse`.
 */
export const MAX_SNAPSHOT_LENGTH = 1_048_576;

/** StrKey shape of an ed25519 secret seed, matched on the `S` prefix alone. */
const SECRET_SEED = /S[A-Z2-7]{55}/;

/**
 * Validates the two pasted snapshots as text.
 *
 * JSON is not parsed here — that belongs with the comparison, which needs the
 * parsed shape anyway and can tell "not JSON" apart from "JSON, but not an
 * account".
 */
export function parseSnapshotInput({
  before: rawBefore,
  after: rawAfter
}: SnapshotInput): Result<SnapshotInput, SnapshotErrorCode> {
  const before = rawBefore.trim();
  const after = rawAfter.trim();

  if (!before || !after) return err("empty_input");
  if (before.length > MAX_SNAPSHOT_LENGTH || after.length > MAX_SNAPSHOT_LENGTH) {
    return err("input_too_large");
  }

  // Matched anywhere in the text, not just at the start: a snapshot is a JSON
  // document, so a pasted seed would be embedded in it rather than alone.
  if (SECRET_SEED.test(before) || SECRET_SEED.test(after)) return err("invalid_input");

  return ok({ before, after });
}
