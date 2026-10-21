import { STROOPS_PER_XLM } from "@/features/reserve-capacity-planner/lib/format";

/**
 * Stellar classic locks two base reserves on the account itself, then one
 * more base reserve for every subentry. Sponsorship is intentionally absent:
 * this planner only counts the four hypothetical inputs.
 */
export const ACCOUNT_RESERVE_ENTRIES = 2n;

/** Documented public-network standard: 0.5 XLM. */
export const DEFAULT_BASE_RESERVE_STROOPS = 5_000_000n;

const NON_NEGATIVE_XLM = /^(?:0|[1-9]\d*)(?:\.\d{1,7})?$/;

/** Converts a validated XLM string into integer stroops. No floating point. */
export function xlmToStroops(value: string): bigint {
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * STROOPS_PER_XLM + BigInt(fraction.padEnd(7, "0"));
}

/**
 * Parses a non-negative XLM amount with at most 7 decimal places.
 * Blank and anything outside that shape return null.
 */
export function parseNonNegativeXlm(raw: string): bigint | null {
  const value = raw.trim();
  if (!NON_NEGATIVE_XLM.test(value)) return null;
  return xlmToStroops(value);
}

/** True when the text is a minus sign followed by a valid non-negative amount. */
export function isNegativeXlmAmount(raw: string): boolean {
  const value = raw.trim();
  if (!value.startsWith("-")) return false;
  return parseNonNegativeXlm(value.slice(1)) !== null;
}

/** minimum = base reserve × (2 + subentry count), in stroops. */
export function minimumBalanceStroops(baseReserveStroops: bigint, subentryCount: bigint): bigint {
  return baseReserveStroops * (ACCOUNT_RESERVE_ENTRIES + subentryCount);
}

export function accountReserveStroops(baseReserveStroops: bigint): bigint {
  return baseReserveStroops * ACCOUNT_RESERVE_ENTRIES;
}

export function subentryReserveStroops(baseReserveStroops: bigint, subentryCount: bigint): bigint {
  return baseReserveStroops * subentryCount;
}
