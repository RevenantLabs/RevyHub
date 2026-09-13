import { err, ok, type Result } from "@/core/result/result";
import type {
  Sep12FieldsErrorCode,
  Sep12FieldsInput
} from "@/features/sep12-fields/types";

/**
 * Longest query that could still be a field search.
 *
 * A SEP-9 field name is a few dozen characters; anything past this bound is a
 * document pasted into the wrong box, and scanning the table against it helps
 * nobody. The limit is on the trimmed query, so trailing paste whitespace
 * cannot trip it.
 */
export const MAX_QUERY_LENGTH = 200;

/**
 * Normalises a search query without judging it.
 *
 * Lowercasing and trimming are the whole of the transformation. Underscores
 * and dots are deliberately preserved: they are load-bearing characters in
 * SEP-9 names, and stripping them would make "address_country_code" and
 * "addresscountrycode" indistinguishable at the point where that distinction
 * is the only thing the tool is for.
 *
 * An empty query is not an error: it means "show me the whole field set".
 */
export function parseSep12FieldsInput(
  raw: string
): Result<Sep12FieldsInput, Sep12FieldsErrorCode> {
  const query = raw.trim().toLowerCase();

  if (query.length > MAX_QUERY_LENGTH) return err("query_too_long");

  return ok({ query });
}
