import { err, ok, type Result } from "@/core/result/result";
import type { SizeErrorCode, SizeInput } from "@/features/transaction-size-analyzer/types";

/**
 * Upper bound for pasted envelope text. The cap exists so a pasted file cannot
 * lock the main thread inside the decoder — and because measuring the size of
 * something that is not a single envelope is meaningless anyway.
 */
export const MAX_ENVELOPE_LENGTH = 65_536;

/** A budget past this is not a transaction budget; it is a typo. */
export const MAX_BUDGET_BYTES = 10_000_000;

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;
const DIGITS = /^\d+$/;

/** StrKey shape of an ed25519 secret seed, matched on the `S` prefix alone. */
const SECRET_SEED = /^S[A-Z2-7]{55}$/;

export interface RawSizeInput {
  envelope: string;
  /** Raw text from the optional budget field; blank means "no budget". */
  budget: string;
}

/**
 * Validates the envelope and the optional byte budget.
 *
 * The budget is parsed with a digits-only regex rather than `Number()`, which
 * happily accepts `"1e3"`, `" 12 "`, `"0x10"` and `"12.9"` — none of which a
 * user meant to type into a byte field, and all of which would silently become
 * a budget they did not choose.
 */
export function parseSizeInput({
  envelope: rawEnvelope,
  budget: rawBudget
}: RawSizeInput): Result<SizeInput, SizeErrorCode> {
  const envelope = rawEnvelope.replace(/\s+/g, "");
  const budget = rawBudget.trim();

  if (!envelope) return err("empty_input");
  if (envelope.length > MAX_ENVELOPE_LENGTH) return err("input_too_large");

  // Refused on the prefix alone, before any decoding, so a pasted seed never
  // reaches the analyser.
  if (SECRET_SEED.test(envelope)) return err("invalid_input");

  if (envelope.length % 4 !== 0 || !BASE64.test(envelope)) return err("invalid_input");

  if (!budget) return ok({ envelope, budgetBytes: null });

  if (!DIGITS.test(budget)) return err("invalid_budget");

  const budgetBytes = Number(budget);
  if (budgetBytes <= 0 || budgetBytes > MAX_BUDGET_BYTES) return err("invalid_budget");

  return ok({ envelope, budgetBytes });
}
