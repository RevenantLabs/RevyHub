import { err, ok, type Result } from "@/core/result/result";
import type { CodeTier } from "@/features/asset-identity-validator/types";

/** Inclusive maximum for the alphanumeric-4 tier. */
export const ALPHANUM4_MAX = 4;

/** Inclusive maximum for the alphanumeric-12 tier. One more character is invalid. */
export const ALPHANUM12_MAX = 12;

export interface CodeLengthTier {
  tier: CodeTier;
  length: number;
}

/**
 * Classifies a code by length alone.
 *
 * Call this before the character check. A 13-character value is the wrong
 * tier even when every character would also be illegal, and the length code
 * is the one the user can act on first.
 */
export function classifyCodeLength(
  code: string
): Result<CodeLengthTier, "empty_code" | "invalid_code_length"> {
  const length = code.length;

  if (length === 0) return err("empty_code");
  if (length <= ALPHANUM4_MAX) return ok({ tier: "alphanum4", length });
  if (length <= ALPHANUM12_MAX) return ok({ tier: "alphanum12", length });

  return err("invalid_code_length");
}
