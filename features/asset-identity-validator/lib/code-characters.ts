import { err, ok, type Result } from "@/core/result/result";

/**
 * Classic asset codes in this tool use the uppercase alphabet only.
 * Lowercase is not rewritten into a canonical code.
 */
const CODE_ALPHABET = /^[A-Z0-9]+$/;

/**
 * Checks the character set and nothing else.
 *
 * Length is a separate rule. This function does not accept a "close enough"
 * code, and it does not trim.
 */
export function validateCodeCharacters(
  code: string
): Result<{ code: string }, "invalid_code_characters"> {
  if (!CODE_ALPHABET.test(code)) return err("invalid_code_characters");
  return ok({ code });
}
