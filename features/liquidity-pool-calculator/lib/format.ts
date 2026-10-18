/** Presentation-only helpers. Domain values stay in fixed-point integers. */
export function formatBps(value: number): string {
  return `${(value / 100).toFixed(2)}%`;
}

export function formatFraction(numerator: bigint, denominator: bigint): string {
  if (denominator === 0n) return "undefined";
  return `${numerator}/${denominator}`;
}

export function formatSummary(value: string): string {
  return value.trim();
}
