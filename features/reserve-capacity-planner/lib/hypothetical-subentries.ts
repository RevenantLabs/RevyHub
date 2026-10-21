import { err, ok, type Result } from "@/core/result/result";
import type { HypotheticalSubentries } from "@/features/reserve-capacity-planner/types";

/** Horizon subentry counts are small; this cap only rejects accidental pastes. */
const MAX_COUNT_DIGITS = 15;

/**
 * Accepts a non-negative integer token. Decimals, signs and exponents are
 * rejected so each field can explain the same rule in its own words.
 */
export function parseHypotheticalCount(raw: string): Result<bigint, "invalid_count"> {
  const value = raw.trim();
  if (!/^\d+$/.test(value) || value.length > MAX_COUNT_DIGITS) return err("invalid_count");
  return ok(BigInt(value));
}

/** Sum of the four hypothetical subentry counts. The master key is not added. */
export function subentryTotal(counts: HypotheticalSubentries): bigint {
  return counts.trustlines + counts.offers + counts.dataEntries + counts.signers;
}
