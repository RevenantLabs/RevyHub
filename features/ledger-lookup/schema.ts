import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type { LedgerErrorCode, LedgerInput } from "@/features/ledger-lookup/types";

const POSITIVE_INTEGER = /^[1-9]\d*$/;
const MAX_SEQUENCE = 4_294_967_295n;

/** Parses raw form input into a validated ledger sequence request. */
export function parseLedgerLookupInput(
  raw: string
): Result<LedgerInput, LedgerErrorCode> {
  const normalized = normalizeInput(raw);
  if (!normalized) return err("empty_input");

  if (!POSITIVE_INTEGER.test(normalized)) {
    return err("invalid_sequence");
  }

  try {
    const sequenceBig = BigInt(normalized);
    if (sequenceBig > MAX_SEQUENCE) {
      return err("invalid_sequence");
    }
    return ok({ sequence: Number(sequenceBig) });
  } catch {
    return err("invalid_sequence");
  }
}
