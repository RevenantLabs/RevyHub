import { err, ok, type Result } from "@/core/result/result";
import type { FeeBreakdownValues } from "@/features/transaction-fee-charge-audit/types";

/** Non-negative integer stroop amounts only — no decimals, signs or whitespace. */
const STROOPS = /^\d+$/;

/**
 * Parses a Horizon fee field into a stroop string suitable for `BigInt`.
 * Numbers are accepted only when they are safe integers.
 */
export function parseStroopAmount(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return STROOPS.test(trimmed) ? trimmed : null;
  }

  if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) {
    return String(value);
  }

  return null;
}

/**
 * Exact offered-versus-charged difference in stroops.
 *
 * Returns `invalid_fee_data` when either side is missing/malformed or when the
 * charged fee exceeds the offered maximum — that should never happen on a
 * settled ledger entry and means the audit cannot complete.
 */
export function computeStroopDifference(
  maxFeeRaw: unknown,
  feeChargedRaw: unknown
): Result<FeeBreakdownValues, "invalid_fee_data"> {
  const maxFee = parseStroopAmount(maxFeeRaw);
  const feeCharged = parseStroopAmount(feeChargedRaw);

  if (maxFee === null || feeCharged === null) {
    return err("invalid_fee_data");
  }

  const offered = BigInt(maxFee);
  const charged = BigInt(feeCharged);

  if (charged > offered) {
    return err("invalid_fee_data");
  }

  return ok({
    maxFee,
    feeCharged,
    difference: (offered - charged).toString()
  });
}
