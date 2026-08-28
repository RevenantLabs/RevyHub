import type { StroopAmount } from "@/features/fee-stats/types";

/** One XLM is 10,000,000 stroops. */
const STROOPS_PER_XLM = 7;

/**
 * Converts a stroop value into an exact stroops/XLM pair.
 *
 * The conversion is done by string padding rather than division, so values
 * beyond `Number.MAX_SAFE_INTEGER` — which `max_fee` regularly reaches —
 * survive intact. Anything that is not a non-negative integer returns null so
 * the caller can render "not reported" instead of a wrong number.
 */
export function toStroopAmount(value: string | number | null | undefined): StroopAmount | null {
  if (value === null || value === undefined) return null;

  let normalized: string;

  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value < 0) return null;
    normalized = String(value);
  } else {
    const trimmed = value.trim();
    if (!/^\d+$/.test(trimmed)) return null;
    normalized = trimmed.replace(/^0+(?=\d)/, "");
  }

  const padded = normalized.padStart(STROOPS_PER_XLM + 1, "0");

  return {
    stroops: normalized,
    xlm: `${padded.slice(0, -STROOPS_PER_XLM)}.${padded.slice(-STROOPS_PER_XLM)}`
  };
}
