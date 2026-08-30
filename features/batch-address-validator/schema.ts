import { err, ok, type Result } from "@/core/result/result";
import type {
  BatchAddressValidatorErrorCode,
  BatchAddressValidatorInput
} from "@/features/batch-address-validator/types";

/** Maximum number of addresses that can be checked in one submission. */
export const MAX_LINES = 500;

/**
 * Parses raw pasted input into individual address candidates.
 *
 * Newlines, commas and whitespace all act as separators — the user does not
 * need to declare which format they used.
 */
export function parseBatchAddressValidatorInput(
  raw: string
): Result<BatchAddressValidatorInput, BatchAddressValidatorErrorCode> {
  if (!raw.trim()) return err("empty_input");

  const lines = raw
    .split(/[\s,\n]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (!lines.length) return err("no_valid_lines");
  if (lines.length > MAX_LINES) return err("too_many_lines");

  return ok({ lines });
}
