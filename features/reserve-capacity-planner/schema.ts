import { err, ok, type Result } from "@/core/result/result";
import { parseHypotheticalCount, subentryTotal } from "@/features/reserve-capacity-planner/lib/hypothetical-subentries";
import {
  DEFAULT_BASE_RESERVE_STROOPS,
  isNegativeXlmAmount,
  parseNonNegativeXlm
} from "@/features/reserve-capacity-planner/lib/reserve-formula";
import {
  COUNT_FIELDS,
  type PlannerField,
  type ReserveCapacityPlannerErrorCode,
  type ReserveCapacityPlannerInput,
  type ReserveCapacityPlannerRawInput
} from "@/features/reserve-capacity-planner/types";

/** Rejects a secret seed on the prefix alone, before any other parsing. */
export function looksLikeSecretKey(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.toUpperCase().startsWith("S");
}

/**
 * Validates planner fields without reading an account. The first failing
 * field wins so the message can name that field.
 */
export function parseReserveCapacityPlannerInput(
  raw: ReserveCapacityPlannerRawInput
): Result<ReserveCapacityPlannerInput, ReserveCapacityPlannerErrorCode, PlannerField> {
  const secretField = secretFieldIn(raw);
  if (secretField) return err("secret_rejected", secretField);

  const subentries = {
    trustlines: 0n,
    offers: 0n,
    dataEntries: 0n,
    signers: 0n
  };

  for (const field of COUNT_FIELDS) {
    const parsed = parseHypotheticalCount(raw[field]);
    if (!parsed.ok) return err("invalid_count", field);
    subentries[field] = parsed.value;
  }

  const baseRaw = raw.baseReserve.trim();
  let baseReserveStroops = DEFAULT_BASE_RESERVE_STROOPS;
  let baseReserveOverridden = false;
  if (baseRaw) {
    const parsed = parseNonNegativeXlm(baseRaw);
    if (parsed === null) return err("invalid_base_reserve", "baseReserve");
    baseReserveStroops = parsed;
    baseReserveOverridden = baseReserveStroops !== DEFAULT_BASE_RESERVE_STROOPS;
  }

  const startingRaw = raw.startingBalance.trim();
  let startingBalanceStroops: bigint | null = null;
  if (startingRaw) {
    if (isNegativeXlmAmount(startingRaw)) return err("negative_starting_balance", "startingBalance");
    const parsed = parseNonNegativeXlm(startingRaw);
    if (parsed === null) return err("invalid_starting_balance", "startingBalance");
    startingBalanceStroops = parsed;
  }

  return ok({
    subentries,
    subentryCount: subentryTotal(subentries),
    baseReserveStroops,
    baseReserveOverridden,
    startingBalanceStroops
  });
}

function secretFieldIn(raw: ReserveCapacityPlannerRawInput): PlannerField | null {
  for (const field of COUNT_FIELDS) {
    if (looksLikeSecretKey(raw[field])) return field;
  }
  if (looksLikeSecretKey(raw.baseReserve)) return "baseReserve";
  if (looksLikeSecretKey(raw.startingBalance)) return "startingBalance";
  return null;
}
