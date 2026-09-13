import { err, ok, type Result } from "@/core/result/result";
import type {
  PaginationErrorCode,
  PaginationInspectorInput
} from "@/features/horizon-pagination-inspector/types";

/**
 * Upper bound for pasted response text.
 *
 * A Horizon page is small, but this tool is meant for responses people have
 * saved to disk, and a truncated curl output can be arbitrarily large. The cap
 * exists so a pasted file cannot lock the main thread inside JSON.parse.
 */
export const MAX_INPUT_LENGTH = 512 * 1024;

/**
 * Validates that there is something to read, without judging its shape.
 *
 * Note what this deliberately does not do: it never collapses internal
 * whitespace. normalizeInput from @/core/lib/strings is the right helper for
 * short identifiers, but running it over a JSON document would rewrite the
 * contents of every string value containing repeated spaces, silently altering
 * a record before it is ever parsed. Only the outer trim is safe here.
 */
export function parseHorizonPaginationInspectorInput(
  raw: string
): Result<PaginationInspectorInput, PaginationErrorCode> {
  const text = raw.trim();

  if (!text) return err("empty_input");
  if (text.length > MAX_INPUT_LENGTH) return err("input_too_large");

  return ok({ text });
}
